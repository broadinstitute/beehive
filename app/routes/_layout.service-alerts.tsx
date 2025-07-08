import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import { ServiceAlertApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { ListServiceAlertButtonText } from "~/features/sherlock/service-alerts/list/list-service-alert-button-text";
import { matchServiceAlert } from "~/features/sherlock/service-alerts/list/match-service-alert";
import { serviceAlertSorter } from "~/features/sherlock/service-alerts/list/service-alert-sorter";
import { ServiceAlertColors } from "~/features/sherlock/service-alerts/service-alert-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";

export const handle = {
  breadcrumb: () => <NavLink to="/service-alerts">Service Alerts</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "Service Alerts",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return new ServiceAlertApi(SherlockConfiguration)
    .apiServiceAlertsV3Get({}, handleIAP(request))
    .then(
      (serviceAlerts) => serviceAlerts.sort(serviceAlertSorter),
      errorResponseThrower,
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const serviceAlerts = useLoaderData<typeof loader>();
  const { serviceAlertId: currentPathServiceAlert } = useParams();
  const [filterText, setFilterText] = useState("");

  return (
    <>
      <InsetPanel>
        <InteractiveList title="Service Alerts" {...ServiceAlertColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate="./new"
            {...ServiceAlertColors}
          />
          <MemoryFilteredList
            entries={serviceAlerts}
            filterText={filterText}
            filter={matchServiceAlert}
          >
            {(serviceAlert, index) => (
              <NavButton
                to={`./${serviceAlert.id}`}
                key={index.toString()}
                forceActive={
                  currentPathServiceAlert === serviceAlert.id?.toString()
                }
                {...ServiceAlertColors}
              >
                <ListServiceAlertButtonText serviceAlert={serviceAlert} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ serviceAlerts }} />
    </>
  );
}

export function useServiceAlertsContext() {
  return useOutletContext<{
    serviceAlerts: SerializeFrom<typeof loader>;
  }>();
}
