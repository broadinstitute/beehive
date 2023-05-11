import { LoaderArgs, SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { ChartsApi, ClustersApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";
import { chartSorter } from "../features/sherlock/charts/list/chart-sorter";
import { ListChartButtonText } from "../features/sherlock/charts/list/list-chart-button-text";
import { matchChart } from "../features/sherlock/charts/list/match-chart";
import { clusterSorter } from "../features/sherlock/clusters/list/cluster-sorter";
import { useEnvironmentChartReleasesContext } from "./_layout.environments.$environmentName.chart-releases";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/chart-releases/add`}>
      Add
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Environment - Add Chart`,
  },
];

export async function loader({ request }: LoaderArgs) {
  return Promise.all([
    new ChartsApi(SherlockConfiguration)
      .apiV2ChartsGet({}, handleIAP(request))
      .then((charts) => charts.sort(chartSorter), errorResponseThrower),
    // We don't actually need the clusters here, but loading them here and passing
    // them down through via context means we won't be loading them repeatedly on
    // the next page if the user is browsing charts to deploy by clicking on them.
    new ClustersApi(SherlockConfiguration)
      .apiV2ClustersGet({}, handleIAP(request))
      .then((clusters) => clusters.sort(clusterSorter), errorResponseThrower),
  ]);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [charts, clusters] = useLoaderData<typeof loader>();
  const context = useEnvironmentChartReleasesContext();

  const chartsInEnvironment = new Set<string>(
    context.chartReleases
      .map((chartRelease) => chartRelease.chart)
      .filter((value): value is string => typeof value === "string")
  );

  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList title="Select Chart to Add" {...ChartColors}>
          <ListControls setFilterText={setFilterText} {...ChartColors} />
          <MemoryFilteredList
            entries={charts}
            filterText={filterText}
            filter={matchChart}
          >
            {(chart, index) => {
              return (
                <NavButton
                  disabled={!chart.name || chartsInEnvironment.has(chart.name)}
                  to={`./${chart.name}`}
                  key={index.toString()}
                  {...ChartColors}
                >
                  <ListChartButtonText chart={chart} />
                </NavButton>
              );
            }}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ clusters, ...context }} />
    </>
  );
}

export const useEnvironmentChartReleasesAddContext = useOutletContext<
  {
    clusters: SerializeFrom<typeof loader>[1];
  } & ReturnType<typeof useEnvironmentChartReleasesContext>
>;
