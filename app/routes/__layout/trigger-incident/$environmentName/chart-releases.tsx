import { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
  V2controllersEnvironment,
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
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/trigger-incident/${params.environmentName}/chart-releases`}>
      Specific Apps
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName} - Trigger Incident - Specific Apps`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesGet(
      { environment: params.environmentName || "" },
      forwardIAP(request)
    )
    .then(
      (chartReleases) =>
        chartReleases.filter(
          (chartRelease) =>
            chartRelease.pagerdutyIntegration &&
            chartRelease.pagerdutyIntegrationInfo?.name
        ),
      errorResponseThrower
    )
    .then((chartReleases) =>
      chartReleases.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartReleasesRoute: React.FunctionComponent = () => {
  const outletContext = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const chartReleases = useLoaderData<Array<V2controllersChartRelease>>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
      <InsetPanel>
        <InteractiveList
          title="Applications with Specific Incident Channels"
          {...ChartReleaseColors}
        >
          <ListControls setFilterText={setFilterText} {...ChartReleaseColors} />
          <MemoryFilteredList
            entries={chartReleases}
            filterText={filterText}
            filter={(chartRelease, filterText) =>
              chartRelease.name?.includes(filterText) ||
              chartRelease.chart?.includes(filterText)
            }
          >
            {(chartRelease, index) => (
              <NavButton
                to={`./${chartRelease.chart}`}
                key={index.toString()}
                {...ChartReleaseColors}
              >
                <h2 className="font-light">
                  <span className="font-medium">{chartRelease.chart}</span>
                  {` (Channel: "${chartRelease.pagerdutyIntegrationInfo?.name}")`}
                </h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ chartReleases, ...outletContext }} />
    </Branch>
  );
};

export default ChartReleasesRoute;
