import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, Params, useLoaderData } from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";
import { chartReleaseSorter } from "../features/sherlock/chart-releases/list/chart-release-sorter";
import { matchChartRelease } from "../features/sherlock/chart-releases/list/match-chart-release";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/trigger-incident/${params.environmentName}/chart-releases`}>
      Specific Apps
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Trigger Incident - Specific Apps`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesGet(
      { environment: params.environmentName || "" },
      handleIAP(request),
    )
    .then(
      (chartReleases) =>
        chartReleases
          .filter(
            (chartRelease) =>
              chartRelease.pagerdutyIntegration &&
              chartRelease.pagerdutyIntegrationInfo?.name,
          )
          .sort(chartReleaseSorter),
      errorResponseThrower,
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const chartReleases = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList
          title="Applications with Specific Incident Channels"
          {...ChartReleaseColors}
        >
          <ListControls setFilterText={setFilterText} {...ChartReleaseColors} />
          <MemoryFilteredList
            entries={chartReleases}
            filterText={filterText}
            filter={matchChartRelease}
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
      <Outlet />
    </>
  );
}
