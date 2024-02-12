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
  useParams,
} from "@remix-run/react";
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
import { ListChartReleaseButtonText } from "../features/sherlock/chart-releases/list/list-chart-release-button-text";
import { matchChartRelease } from "../features/sherlock/chart-releases/list/match-chart-release";
import { useEnvironmentContext } from "./_layout.environments.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/chart-releases`}>
      Charts
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Environment - Chart Instances`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiChartReleasesV3Get(
      { environment: params.environmentName || "" },
      handleIAP(request),
    )
    .then(
      (chartReleases) => chartReleases.sort(chartReleaseSorter),
      errorResponseThrower,
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const chartReleases = useLoaderData<typeof loader>();
  const context = useEnvironmentContext();
  const params = useParams();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel alwaysShowScrollbar>
        <InteractiveList
          title={`Charts in ${params.environmentName}`}
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
            filter={matchChartRelease}
          >
            {(chartRelease, index) => (
              <NavButton
                to={`./${chartRelease.chart}`}
                key={index.toString()}
                {...ChartReleaseColors}
              >
                <ListChartReleaseButtonText chartRelease={chartRelease} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ chartReleases, ...context }} />
    </>
  );
}

export const useEnvironmentChartReleasesContext = useOutletContext<
  {
    chartReleases: SerializeFrom<typeof loader>;
  } & ReturnType<typeof useEnvironmentContext>
>;
