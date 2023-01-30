import { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { PagerdutyIntegrationGeneralLinkDescription } from "~/features/sherlock/pagerduty-integrations/link-pagerduty/pagerduty-integration-general-link-description";
import { OutsetPanel } from "~/components/layout/outset-panel";
import {
  getPdAppIdFromEnv,
  PagerdutyInstallLink,
} from "~/components/logic/pagerduty-token";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PagerdutyIntegrationColors } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import { PanelErrorBoundary } from "../errors/components/error-boundary";

export const handle = {
  breadcrumb: () => <NavLink to="/pagerduty-integrations/link">Link</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Link - PagerDuty Integrations",
  },
];

export async function loader(_: LoaderArgs) {
  return getPdAppIdFromEnv();
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const pdAppId = useLoaderData<typeof loader>();
  return (
    <OutsetPanel {...PagerdutyIntegrationColors}>
      <ItemDetails title="PagerDuty Integration Linking and Setup">
        <PagerdutyIntegrationGeneralLinkDescription />
        <PagerdutyInstallLink pdAppID={pdAppId} />
      </ItemDetails>
    </OutsetPanel>
  );
}
