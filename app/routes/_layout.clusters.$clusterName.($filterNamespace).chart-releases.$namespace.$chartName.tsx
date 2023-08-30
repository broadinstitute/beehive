import type {
  LoaderArgs,
  SerializeFrom,
  V2_MetaFunction,
} from "@remix-run/node";
import { defer } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import {
  ChartReleasesApi,
  CiIdentifiersApi,
} from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ChartReleaseDetails } from "~/features/sherlock/chart-releases/view/chart-release-details";
import { EnvironmentOfflineIcon } from "~/features/sherlock/environments/offline/environment-offline-icon";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}`}
    >
      {params.namespace}/{params.chartName}
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return defer({
    ciRuns: new CiIdentifiersApi(SherlockConfiguration)
      .apiCiIdentifiersV3SelectorGet(
        {
          selector: `chart-release/${params.clusterName}/${params.namespace}/${params.chartName}`,
        },
        handleIAP(request),
      )
      .then(
        (ciIdentifier) => ciIdentifier.ciRuns,
        () => [],
      ),
    chartRelease: await new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesSelectorGet(
        {
          selector: `${params.clusterName}/${params.namespace}/${params.chartName}`,
        },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease, ciRuns } = useLoaderData<typeof loader>();
  return (
    <>
      <OutsetPanel {...ChartReleaseColors}>
        <ItemDetails
          subtitle={`Instance of ${chartRelease.chart} in the ${chartRelease.namespace} namespace`}
          title={`${chartRelease.name}${
            chartRelease.environmentInfo?.offline === true ? " (stopped)" : ""
          }`}
          icon={
            chartRelease.environmentInfo?.lifecycle === "dynamic" &&
            !chartRelease.environmentInfo.preventDeletion &&
            chartRelease.environmentInfo.offline != undefined && (
              <EnvironmentOfflineIcon
                environmentName={chartRelease.environment || ""}
                offline={chartRelease.environmentInfo.offline}
              />
            )
          }
        >
          <ChartReleaseDetails
            chartRelease={chartRelease}
            initialCiRuns={ciRuns}
            toChangeVersions="./change-versions"
            toVersionHistory="./applied-changesets"
            toEdit="./edit"
            toDatabaseInstance="./database-instance"
            toEditDeployHooks="./deploy-hooks"
            // toLinkPagerduty={
            //   chartRelease.environmentInfo?.pagerdutyIntegration
            //     ? "./link-pagerduty"
            //     : ""
            // }
            toDelete="./delete"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ chartRelease }} />
    </>
  );
}

export const useClusterChartReleaseContext = useOutletContext<{
  chartRelease: SerializeFrom<typeof loader>["chartRelease"];
}>;
