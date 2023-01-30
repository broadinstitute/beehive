import { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useParams,
} from "@remix-run/react";
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
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { useClusterContext } from "~/routes/_layout.clusters.$clusterName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}${
        params.filterNamespace ? `/${params.filterNamespace}` : ""
      }/chart-releases`}
    >
      {params.filterNamespace ? `${params.filterNamespace}` : "Charts"}
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${
      params.filterNamespace
        ? `${params.clusterName}/${params.filterNamespace} - Namespace`
        : `${params.clusterName} - Cluster`
    } - Chart Instances`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesGet(
      {
        cluster: params.clusterName || "",
        namespace: params.filterNamespace || undefined,
      },
      forwardIAP(request)
    )
    .then(
      // Sherlock's API doesn't really have a great mechanism for
      // "chart releases that aren't in a template environment" at
      // the moment so we just loop over it here.
      (chartReleases) =>
        chartReleases
          .filter(
            (chartRelease) =>
              chartRelease.environmentInfo?.lifecycle !== "template"
          )
          .sort(chartReleaseSorter),
      errorResponseThrower
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const params = useParams();
  const chartReleases = useLoaderData<typeof loader>();
  const context = useClusterContext();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList
          title={`Charts in ${
            params.filterNamespace
              ? `${params.filterNamespace} Namespace`
              : params.clusterName
          }`}
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
                to={`./${chartRelease.namespace}/${chartRelease.chart}`}
                key={index.toString()}
                {...ChartReleaseColors}
              >
                <ListChartReleaseButtonText
                  chartRelease={chartRelease}
                  showDestination="cluster"
                />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={context} />
    </>
  );
}
