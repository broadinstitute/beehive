import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import {
  PagerdutyInstallLink,
  getPdAppIdFromEnv,
} from "~/components/logic/pagerduty-token";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PagerdutyIntegrationGeneralLinkDescription } from "~/features/sherlock/pagerduty-integrations/link-pagerduty/pagerduty-integration-general-link-description";
import { PagerdutyIntegrationColors } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import { PanelErrorBoundary } from "../errors/components/error-boundary";

export const handle = {
  breadcrumb: () => <NavLink to="/pagerduty-integrations/link">Link</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "Link - PagerDuty Integrations",
  },
];

export async function loader(_: LoaderFunctionArgs) {
  return getPdAppIdFromEnv();
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const pdAppId = useLoaderData<typeof loader>();
  return (
    <>
      <OutsetPanel {...PagerdutyIntegrationColors}>
        <ItemDetails title="PagerDuty Integration Linking and Setup">
          <PagerdutyIntegrationGeneralLinkDescription />
          <PagerdutyInstallLink pdAppID={pdAppId} />
        </ItemDetails>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
