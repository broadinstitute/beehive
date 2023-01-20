import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, Params, useLoaderData } from "@remix-run/react";
import {
  PagerdutyIntegrationsApi,
  V2controllersPagerdutyIntegration,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { PagerdutyIntegrationColors } from "~/components/content/pagerduty-integration/pagerduty-integration-colors";
import { PagerdutyIntegrationDetails } from "~/components/content/pagerduty-integration/pagerduty-integration-details";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Branch } from "~/components/route-tree/branch";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/pagerduty-integrations/${params.pagerdutyID}`}>
      Details
    </NavLink>
  ),
};

export const meta: MetaFunction = () => ({
  title: "Details - PagerDuty Integration",
});

export const loader: LoaderFunction = async ({ request, params }) => {
  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiV2PagerdutyIntegrationsSelectorGet(
      {
        selector: `pd-id/${params.pagerdutyID}`,
      },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const PagerdutyIdRoute: React.FunctionComponent = () => {
  const pagerdutyIntegration =
    useLoaderData<V2controllersPagerdutyIntegration>();
  return (
    <Branch prod>
      <OutsetPanel {...PagerdutyIntegrationColors}>
        <ItemDetails
          subtitle="PagerDuty Integration"
          title={pagerdutyIntegration.name || ""}
        >
          <PagerdutyIntegrationDetails
            pagerdutyIntegration={pagerdutyIntegration}
            toDelete="./delete"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ pagerdutyIntegration }} />
    </Branch>
  );
};

export default PagerdutyIdRoute;
