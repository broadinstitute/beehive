import { json, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import {
  ChartReleasesApi,
  EnvironmentsApi,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { promiseHash } from "remix-utils";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { chartReleaseSorter } from "~/features/sherlock/chart-releases/list/chart-release-sorter";
import { matchChartRelease } from "~/features/sherlock/chart-releases/list/match-chart-release";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { ListChartButtonText } from "~/features/sherlock/charts/list/list-chart-button-text";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: () => <NavLink to="/apps">Apps</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Apps",
  },
];

export async function loader({ request }: LoaderArgs) {
  const forwardedIAP = handleIAP(request);
  return json(
    await promiseHash({
      chartReleases: new ChartReleasesApi(SherlockConfiguration)
        .apiV2ChartReleasesGet(
          {
            environment: "dev",
          },
          forwardedIAP
        )
        .then(
          (chartReleases) =>
            chartReleases
              .filter((chartRelease) => chartRelease.chartInfo?.appImageGitRepo)
              .sort(chartReleaseSorter),
          errorResponseThrower
        ),
      environments: new EnvironmentsApi(
        SherlockConfiguration
      ).apiV2EnvironmentsGet(
        {
          base: "live",
        },
        forwardedIAP
      ),
    })
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartReleases, environments } = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel alwaysShowScrollbar size="one-fourth">
        <InteractiveList title="Apps" size="one-fourth" {...ChartColors}>
          <ListControls
            setFilterText={setFilterText}
            size="one-fourth"
            {...ChartColors}
          />
          <MemoryFilteredList
            entries={chartReleases}
            filterText={filterText}
            filter={matchChartRelease}
          >
            {(chartRelease, index) => (
              <NavButton
                to={`./${chartRelease.chart}`}
                key={index.toString()}
                {...ChartColors}
              >
                {chartRelease.chartInfo && (
                  <ListChartButtonText
                    chart={chartRelease.chartInfo}
                    includeChartRepo={false}
                  />
                )}
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ environments }} />
    </>
  );
}
