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
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: () => <NavLink to="/charts">Charts</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Charts",
  },
];

export async function loader({ request }: LoaderArgs) {
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsGet({}, handleIAP(request))
    .then((charts) => charts.sort(chartSorter), errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const charts = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList title="Charts" {...ChartColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate="./new"
            {...ChartColors}
          />
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
                <ListChartButtonText chart={chart} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </>
  );
}
