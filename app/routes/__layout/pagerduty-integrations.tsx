import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import {
  PagerdutyIntegrationsApi,
  V2controllersPagerdutyIntegration,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { PagerdutyIntegrationColors } from "~/components/content/pagerduty-integration/pagerduty-integration-colors";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => (
    <NavLink to="/pagerduty-integrations">Pagerduty Integrations</NavLink>
  ),
};

export const meta: MetaFunction = () => ({
  title: "PagerDuty Integrations",
});

export const loader: LoaderFunction = async ({ request }) => {
  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiV2PagerdutyIntegrationsGet({}, forwardIAP(request))
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const PagerdutyIntegrationsRoute: React.FunctionComponent = () => {
  const pagerdutyIntegrations =
    useLoaderData<Array<V2controllersPagerdutyIntegration>>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
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
    </Branch>
  );
};

export default PagerdutyIntegrationsRoute;
