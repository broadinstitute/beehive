import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PagerdutyIntegrationColors } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";

export const handle = {
  breadcrumb: () => (
    <NavLink to="/pagerduty-integrations">Pagerduty Integrations</NavLink>
  ),
};

export const meta: MetaFunction = () => [
  {
    title: "PagerDuty Integrations",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiPagerdutyIntegrationsV3Get({}, handleIAP(request))
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const pagerdutyIntegrations = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList
          title="PagerDuty Integrations"
          {...PagerdutyIntegrationColors}
        >
          <ListControls
            setFilterText={setFilterText}
            toCreate="./link"
            toCreateText="Link"
            {...PagerdutyIntegrationColors}
          />
          <MemoryFilteredList
            entries={pagerdutyIntegrations}
            filterText={filterText}
            filter={(integration, filterText) =>
              integration.name?.includes(filterText) ||
              integration.pagerdutyID?.includes(filterText)
            }
          >
            {(integration, index) => (
              <NavButton
                to={`./${integration.pagerdutyID}`}
                key={index.toString()}
                {...PagerdutyIntegrationColors}
              >
                <h2 className="font-medium">{integration.name}</h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </>
  );
}
