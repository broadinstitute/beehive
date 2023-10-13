import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
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
import { ProdFlag } from "~/components/layout/prod-flag";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ChartReleaseDetails } from "~/features/sherlock/chart-releases/view/chart-release-details";
import { EnvironmentOfflineIcon } from "~/features/sherlock/environments/offline/environment-offline-icon";
import { ProdWarning } from "~/features/sherlock/prod-warning";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}`}
    >
      {params.chartReleaseName}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return defer({
    ciRuns: new CiIdentifiersApi(SherlockConfiguration)
      .apiCiIdentifiersV3SelectorGet(
        {
          selector: `chart-release/${params.chartReleaseName}`,
        },
        handleIAP(request),
      )
      .then(
        (ciIdentifier) => ciIdentifier.ciRuns,
        () => undefined,
      ),
    chartRelease: await new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesSelectorGet(
        {
          selector: params.chartReleaseName || "",
        },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease, ciRuns } = useLoaderData<typeof loader>();
  const prod =
    chartRelease.environment === "prod" ||
    chartRelease.cluster === "terra-prod";
  return (
    <ProdFlag prod={prod}>
      <OutsetPanel {...ChartReleaseColors}>
        <ItemDetails
          subtitle={`Instance of ${chartRelease.chart}`}
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
          {prod && <ProdWarning name={chartRelease.name || ""} />}
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
            toDelete={prod ? undefined : "./delete"}
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ chartRelease }} />
    </ProdFlag>
  );
}

export const useChartChartReleaseContext = useOutletContext<{
  chartRelease: SerializeFrom<typeof loader>["chartRelease"];
}>;
