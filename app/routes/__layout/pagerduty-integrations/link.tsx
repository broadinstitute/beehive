import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { PagerdutyIntegrationColors } from "~/components/content/pagerduty-integration/pagerduty-integration-colors";
import { PagerdutyIntegrationGeneralLinkDescription } from "~/components/content/pagerduty-integration/pagerduty-integration-general-link-description";
import { OutsetPanel } from "~/components/layout/outset-panel";
import {
  getPdAppIdFromEnv,
  PagerdutyInstallLink,
} from "~/components/logic/pagerduty-token";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Branch } from "~/components/route-tree/branch";

export const handle = {
  breadcrumb: () => <NavLink to="/pagerduty-integrations/link">Link</NavLink>,
};

export const meta: MetaFunction = () => ({
  title: "Link - PagerDuty Integrations",
});

export const loader: LoaderFunction = async () => {
  return getPdAppIdFromEnv();
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const LinkRoute: React.FunctionComponent = () => {
  const pdAppId = useLoaderData<string>();
  return (
    <Branch>
      <OutsetPanel {...PagerdutyIntegrationColors}>
        <ItemDetails title="PagerDuty Integration Linking and Setup">
          <PagerdutyIntegrationGeneralLinkDescription />
          <PagerdutyInstallLink pdAppID={pdAppId} />
        </ItemDetails>
      </OutsetPanel>
    </Branch>
  );
};

export default LinkRoute;
