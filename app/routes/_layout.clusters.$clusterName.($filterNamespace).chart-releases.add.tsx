import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { ChartsApi, EnvironmentsApi } from "@sherlock-js-client/sherlock";
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
import { makeEnvironmentSorter } from "~/features/sherlock/environments/list/environment-sorter";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getUserEmail } from "~/helpers/get-user-email.server";
import { useClusterContext } from "~/routes/_layout.clusters.$clusterName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/clusters/${params.clusterName}/chart-releases/add`}>
      Add
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName} - Cluster - Add Chart`,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const selfUserEmail = getUserEmail(request);
  return Promise.all([
    new ChartsApi(SherlockConfiguration)
      .apiChartsV3Get({}, handleIAP(request))
      .then((charts) => charts.sort(chartSorter), errorResponseThrower),
    // We don't actually need the environments here, but loading them here and passing
    // them down through via context means we won't be loading them repeatedly on
    // the next page if the user is browsing charts to deploy by clicking on them.
    new EnvironmentsApi(SherlockConfiguration)
      .apiEnvironmentsV3Get({}, handleIAP(request))
      .then(
        (environments) =>
          environments.sort(makeEnvironmentSorter(null, selfUserEmail)),
        errorResponseThrower,
      ),
  ]);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [charts, environments] = useLoaderData<typeof loader>();
  const context = useClusterContext();

  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList title="Select Chart to Add" {...ChartColors}>
          <ListControls setFilterText={setFilterText} {...ChartColors} />
          <MemoryFilteredList
            entries={charts}
            filterText={filterText}
            filter={(chart, filterText) =>
              chart.name?.includes(filterText) ||
              chart.chartRepo?.includes(filterText)
            }
          >
            {(chart, index) => (
              <NavButton
                to={`./${chart.name}`}
                key={index.toString()}
                {...ChartColors}
              >
                <h2 className="font-light">
                  {`${chart.chartRepo} / `}
                  {<span className="font-medium">{chart.name}</span>}
                </h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ environments, ...context }} />
    </>
  );
}

export const useClusterChartReleasesAddContext = useOutletContext<
  {
    environments: SerializeFrom<typeof loader>[1];
  } & ReturnType<typeof useClusterContext>
>;
