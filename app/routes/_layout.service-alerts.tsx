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
import { EnvironmentsApi, ServiceAlertApi } from "@sherlock-js-client/sherlock";
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

export const handle = {
  breadcrumb: () => <NavLink to="/service-alerts">Service Alerts</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "Service Alerts",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const serviceAlerts = await new ServiceAlertApi(SherlockConfiguration)
      .apiServiceAlertsV3Get({}, handleIAP(request))
      .then(
        (serviceAlerts) => (serviceAlerts || []).sort(serviceAlertSorter),
        () => [],
      );

    const environments = await new EnvironmentsApi(SherlockConfiguration)
      .apiEnvironmentsV3Get({}, handleIAP(request))
      .catch(() => []);

    return {
      serviceAlerts: serviceAlerts || [],
      environments: environments || [],
    };
  } catch (error) {
    console.error("Service alerts loader error:", error);
    return { serviceAlerts: [], environments: [] };
  }
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const loaderData = useLoaderData<typeof loader>();
  const { serviceAlerts = [], environments = [] } = loaderData || {};
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
            filter={(serviceAlert, matchText) =>
              matchServiceAlert(serviceAlert, matchText, environments)
            }
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
                <ListServiceAlertButtonText
                  serviceAlert={serviceAlert}
                  environments={environments}
                />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet
        context={{
          serviceAlerts: serviceAlerts || [],
          environments: environments || [],
        }}
      />
    </>
  );
}

export function useServiceAlertsContext() {
  return useOutletContext<{
    serviceAlerts: SerializeFrom<typeof loader>["serviceAlerts"];
    environments: SerializeFrom<typeof loader>["environments"];
  }>();
}
