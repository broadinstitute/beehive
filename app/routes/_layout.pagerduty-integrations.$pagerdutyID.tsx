import { LoaderArgs, SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PagerdutyIntegrationColors } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import { PagerdutyIntegrationDetails } from "~/features/sherlock/pagerduty-integrations/view/pagerduty-integration-details";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { ProdFlag } from "../components/layout/prod-flag";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/pagerduty-integrations/${params.pagerdutyID}`}>
      Details
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Details - PagerDuty Integration",
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiV2PagerdutyIntegrationsSelectorGet(
      {
        selector: `pd-id/${params.pagerdutyID}`,
      },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const pagerdutyIntegration = useLoaderData<typeof loader>();
  return (
    <ProdFlag prod>
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
    </ProdFlag>
  );
}

export const usePagerdutyIntegrationContext = useOutletContext<{
  pagerdutyIntegration: SerializeFrom<typeof loader>;
}>;
