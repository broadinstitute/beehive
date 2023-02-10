import { LoaderArgs, SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { EnvironmentsApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { EnvironmentDetails } from "~/features/sherlock/environments/view/environment-details";
import { EnvironmentOfflineIcon } from "~/features/sherlock/environments/view/environment-offline-icon";
import {
  forwardIAP,
  SherlockConfiguration,
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
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorGet(
      { selector: params.environmentName || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const environment = useLoaderData<typeof loader>();
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
            !environment.preventDeletion &&
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
            toChartReleases="./chart-releases"
            toChangeVersions="./change-versions"
            toEdit="./edit"
            // toLinkPagerduty={
            //   environment.lifecycle == "static" ? "./link-pagerduty" : ""
            // }
            toDelete={environment.lifecycle != "static" ? "./delete" : ""}
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ environment }} />
    </ProdFlag>
  );
}

export const useEnvironmentContext = useOutletContext<{
  environment: SerializeFrom<typeof loader>;
}>;
