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
  EnvironmentsApi,
} from "@sherlock-js-client/sherlock";
import { promiseHash } from "remix-utils";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { chartReleaseUrl } from "~/features/sherlock/chart-releases/chart-release-url";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { EnvironmentOfflineIcon } from "~/features/sherlock/environments/offline/environment-offline-icon";
import { EnvironmentDetails } from "~/features/sherlock/environments/view/environment-details";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { toTitleCase } from "~/helpers/strings";
import { ProdFlag } from "../components/layout/prod-flag";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}`}>
      {params.environmentName}
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment` },
];

export async function loader({ request, params }: LoaderArgs) {
  return defer({
    ciRuns: new CiIdentifiersApi(SherlockConfiguration)
      .apiCiIdentifiersV3SelectorGet(
        {
          selector: `environment/${params.environmentName}`,
        },
        handleIAP(request),
      )
      .then(
        (ciIdentifier) => ciIdentifier.ciRuns,
        () => [],
      ),
    ...(await promiseHash({
      environment: new EnvironmentsApi(SherlockConfiguration)
        .apiV2EnvironmentsSelectorGet(
          { selector: params.environmentName || "" },
          handleIAP(request),
        )
        .catch(errorResponseThrower),
      terrauiInstance: new ChartReleasesApi(SherlockConfiguration)
        .apiV2ChartReleasesSelectorGet(
          { selector: `${params.environmentName}/terraui` },
          handleIAP(request),
        )
        .catch(() => null),
    })),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { environment, terrauiInstance, ciRuns } =
    useLoaderData<typeof loader>();
  return (
    <ProdFlag prod={environment.name === "prod"}>
      <OutsetPanel {...EnvironmentColors}>
        <ItemDetails
          subtitle={`${
            environment.lifecycle == "template" ? "BEE " : ""
          }${toTitleCase(environment.lifecycle || "")}${
            environment.lifecycle == "dynamic" ? " BEE" : " "
          } environment`}
          title={`${environment.name}${
            environment.offline ? " (stopped)" : ""
          }`}
          icon={
            environment.lifecycle === "dynamic" &&
            (!environment.preventDeletion || environment.offline === true) &&
            environment.offline != undefined && (
              <EnvironmentOfflineIcon
                environmentName={environment.name || ""}
                offline={environment.offline}
              />
            )
          }
        >
          <EnvironmentDetails
            environment={environment}
            initialCiRuns={ciRuns}
            toTerraUI={chartReleaseUrl(terrauiInstance)}
            toChartReleases="./chart-releases"
            toChangeVersions="./change-versions"
            toEdit="./edit"
            toSchedule="./schedule"
            // toLinkPagerduty={
            //   environment.lifecycle == "static" ? "./link-pagerduty" : ""
            // }
            toDelete={"./delete"}
            toAdjustBulkUpdateDefaults="./adjust-bulk-update-defaults"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ environment }} />
    </ProdFlag>
  );
}

export const useEnvironmentContext = useOutletContext<{
  environment: SerializeFrom<typeof loader>["environment"];
}>;
