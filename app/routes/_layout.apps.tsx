import { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { chartSorter } from "~/features/sherlock/charts/list/chart-sorter";
import { ListChartButtonText } from "~/features/sherlock/charts/list/list-chart-button-text";
import { matchChart } from "~/features/sherlock/charts/list/match-chart";
import {
  forwardIAP,
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
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsGet({}, forwardIAP(request))
    .then(
      (charts) =>
        charts.filter((chart) => chart.appImageGitRepo).sort(chartSorter),
      errorResponseThrower
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const charts = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel alwaysShowScrollbar>
        <InteractiveList title="Apps" {...ChartColors}>
          <ListControls setFilterText={setFilterText} {...ChartColors} />
          <MemoryFilteredList
            entries={charts}
            filterText={filterText}
            filter={matchChart}
          >
            {(chart, index) => (
              <NavButton
                to={`./${chart.name}`}
                key={index.toString()}
                {...ChartColors}
              >
                <ListChartButtonText chart={chart} includeChartRepo={false} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </>
  );
}
