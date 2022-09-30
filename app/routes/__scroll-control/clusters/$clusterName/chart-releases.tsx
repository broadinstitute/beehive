import { LoaderFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/clusters/${params.clusterName}/chart-releases`}>
        Charts
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesGet(
      { cluster: params.clusterName || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartReleasesRoute: React.FunctionComponent = () => {
  const params = useParams();
  const chartReleases = useLoaderData<Array<V2controllersChartRelease>>();
  const { cluster } = useOutletContext<{ cluster: V2controllersCluster }>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
      <InsetPanel>
        <InteractiveList
          title={`Charts in ${params.clusterName}`}
          {...ChartReleaseColors}
        >
          <ListControls
            setFilterText={setFilterText}
            toCreate="./add"
            toCreateText="Add New"
            {...ChartReleaseColors}
          />
          <MemoryFilteredList
            entries={chartReleases}
            filterText={filterText}
            filter={(chartRelease, filterText) =>
              chartRelease.name?.includes(filterText) ||
              chartRelease.namespace?.includes(filterText)
            }
          >
            {(chartRelease, index) => (
              <NavButton
                to={`./${chartRelease.name}`}
                key={index.toString()}
                {...ChartReleaseColors}
              >
                <h2 className="font-light">
                  {`${chartRelease.namespace} / `}
                  <span className="font-medium">{chartRelease.chart}</span>
                </h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ cluster }} />
    </Branch>
  );
};

export default ChartReleasesRoute;
