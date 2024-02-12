import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ChartsApi, EnvironmentsApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { promiseHash } from "remix-utils/promise";
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
  breadcrumb: () => <NavLink to="/apps">Apps</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "Apps",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const forwardedIAP = handleIAP(request);
  return json(
    await promiseHash({
      charts: new ChartsApi(SherlockConfiguration)
        .apiChartsV3Get({}, forwardedIAP)
        .then(
          (charts) =>
            charts.filter((chart) => chart.appImageGitRepo).sort(chartSorter),
          errorResponseThrower,
        ),
      environments: new EnvironmentsApi(
        SherlockConfiguration,
      ).apiEnvironmentsV3Get(
        {
          base: "live",
        },
        forwardedIAP,
      ),
    }),
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { charts, environments } = useLoaderData<typeof loader>();
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
                {<ListChartButtonText chart={chart} includeChartRepo={false} />}
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ environments }} />
    </>
  );
}
