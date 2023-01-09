import { LoaderFunction, MetaFunction, SerializeFrom } from "@remix-run/node";
import {
  NavLink,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import {
  ChangesetsApi,
  V2controllersChangeset,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { useMemo, useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChangesetEntry } from "~/components/content/changeset/changeset-entry";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ListPaginationControls } from "~/components/interactivity/list-pagination-controls";
import { DoubleInsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Leaf } from "~/components/route-tree/leaf";
import {
  errorResponseThrower,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/applied-changesets`}
    >
      Version History
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName}/${params.chartName} - Chart Instance - Version History`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const offsetString = url.searchParams.get("offset");
  const offset = offsetString ? parseInt(offsetString) : 0;
  const limitString = url.searchParams.get("limit");
  const limit = limitString ? parseInt(limitString) : 25;
  return Promise.all([
    new ChangesetsApi(SherlockConfiguration)
      .apiV2ProceduresChangesetsQueryAppliedForChartReleaseSelectorGet({
        selector: `${params.environmentName}/${params.chartName}`,
        offset: offset,
        limit: limit,
      })
      .catch(errorResponseThrower),
    offset,
    limit,
  ]);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const AppliedChangesetsRoute: React.FunctionComponent = () => {
  const [changesets, offset, limit] =
    useLoaderData<[Array<V2controllersChangeset>, number, number]>();
  const { chartRelease } = useOutletContext<{
    chartRelease: SerializeFrom<V2controllersChartRelease>;
  }>();
  // Our existing chart release has more deeply-nested data than what the API just
  // gave us, and it was repetitive anyway, so we just slot ours in.
  const assembledChangesets = useMemo(() => {
    changesets.forEach((changeset) => {
      changeset.chartReleaseInfo = chartRelease;
    });
    return changesets;
  }, [changesets, chartRelease]);

  const [filterText, setFilterText] = useState("");

  return (
    <Leaf>
      <DoubleInsetPanel>
        <InteractiveList
          title="Version History"
          doubleWidth
          {...ChartReleaseColors}
        >
          <ListPaginationControls
            filterText={filterText}
            setFilterText={setFilterText}
            offset={offset}
            limit={limit}
            currentCount={changesets.length}
            doubleWidth
            {...ChartReleaseColors}
          />
          <MemoryFilteredList
            filterText={filterText}
            entries={assembledChangesets}
            filter={(changeset, filterText) =>
              changeset.chartReleaseInfo?.appVersionExact?.includes(
                filterText
              ) ||
              changeset.toAppVersionResolver?.includes(filterText) ||
              changeset.chartReleaseInfo?.chartVersionExact?.includes(
                filterText
              ) ||
              changeset.toChartVersionResolver?.includes(filterText)
            }
          >
            {(changeset, index) => (
              <ChangesetEntry
                changeset={changeset}
                key={index}
                disableTitle={true}
                fadeIfUnappliable={false}
                startMinimized={true}
              />
            )}
          </MemoryFilteredList>
          {changesets.length > 3 && (
            <ListPaginationControls
              filterText={filterText}
              setFilterText={setFilterText}
              offset={offset}
              limit={limit}
              currentCount={changesets.length}
              doubleWidth
              {...ChartReleaseColors}
            />
          )}
        </InteractiveList>
      </DoubleInsetPanel>
    </Leaf>
  );
};

export default AppliedChangesetsRoute;
