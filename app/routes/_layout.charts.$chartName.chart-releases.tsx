import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { chartReleaseSorter } from "~/features/sherlock/chart-releases/list/chart-release-sorter";
import { ListChartReleaseButtonText } from "~/features/sherlock/chart-releases/list/list-chart-release-button-text";
import { matchChartRelease } from "~/features/sherlock/chart-releases/list/match-chart-release";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}/chart-releases`}>
      Instances
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartName} - Chart - Instances`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiChartReleasesV3Get(
      { chart: params.chartName || "" },
      handleIAP(request),
    )
    .then(
      (chartReleases) => chartReleases.sort(chartReleaseSorter),
      errorResponseThrower,
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const params = useParams();
  const chartReleases = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList
          title={`Instances of ${params.chartName}`}
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
                to={`./${chartRelease.name}`}
                key={index.toString()}
                {...ChartReleaseColors}
              >
                <ListChartReleaseButtonText
                  chartRelease={chartRelease}
                  showDestination="auto"
                />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </>
  );
}
