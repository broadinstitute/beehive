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
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PagerdutyIntegrationColors } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import { PagerdutyIntegrationDetails } from "~/features/sherlock/pagerduty-integrations/view/pagerduty-integration-details";
import {
  SherlockConfiguration,
  handleIAP,
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

export const meta: MetaFunction = () => [
  {
    title: "Details - PagerDuty Integration",
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiPagerdutyIntegrationsV3SelectorGet(
      {
        selector: `pd-id/${params.pagerdutyID}`,
      },
      handleIAP(request),
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
