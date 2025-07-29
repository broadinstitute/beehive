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
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { getEnvironmentName } from "~/features/sherlock/service-alerts/get-environment-name";
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
  const [environmentFilter, setEnvironmentFilter] = useState<string>("all");

  // Create environment filter buttons component
  const EnvironmentFilterButtons = () => (
    <div className="flex flex-row gap-2 mb-4">
      <div className="min-h-[3rem] w-full gap-2 grid grid-cols-4">
        {[
          ["All", "all"],
          ["Dev", "dev"],
          ["Staging", "staging"],
          ["Prod", "prod"],
        ].map(([displayValue, valueToSet], index) => (
          <div className="relative" key={index}>
            <button
              type="button"
              className={`p-2 w-full h-full shadow-md hover:shadow-lg flex flex-col items-center justify-center ${
                index === 0 ? "rounded-l-2xl before:rounded-l-2xl" : ""
              } ${
                index === 3 ? "rounded-r-2xl before:rounded-r-2xl" : ""
              } focus-visible:outline focus-visible:outline-color-focused-element
                before:w-full before:h-full before:block before:absolute ${ServiceAlertColors.beforeBorderClassName} ${
                  valueToSet === environmentFilter
                    ? "bg-color-nearest-bg before:border-4 font-medium"
                    : "bg-color-nearest-bg/50 before:border-2 before:hover:border-4"
                } motion-safe:transition-all before:motion-safe:transition-all text-color-header-text`}
              onClick={() => setEnvironmentFilter(valueToSet)}
            >
              {displayValue}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Filter service alerts by environment and text search
  const filteredServiceAlerts = serviceAlerts.filter((serviceAlert) => {
    // Environment filter - get the environment name for this service alert and compare
    const serviceAlertEnvironmentName = getEnvironmentName(
      serviceAlert.onEnvironment,
      environments,
    );
    const passesEnvironmentFilter =
      environmentFilter === "all" ||
      serviceAlertEnvironmentName.toLowerCase() ===
        environmentFilter.toLowerCase();

    // Text filter - if no filterText, show all that pass environment filter
    const passesTextFilter =
      !filterText || matchServiceAlert(serviceAlert, filterText, environments);

    return passesEnvironmentFilter && passesTextFilter;
  });

  return (
    <>
      <InsetPanel>
        <InteractiveList title="Service Alerts" {...ServiceAlertColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate="./new"
            {...ServiceAlertColors}
          />
          <EnvironmentFilterButtons />
          <div className="flex flex-col space-y-4">
            {filteredServiceAlerts.length > 0 ? (
              filteredServiceAlerts.map((serviceAlert, index) => (
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
              ))
            ) : (
              <div className="text-center text-color-placeholder-text py-8">
                {environmentFilter === "all" && filterText
                  ? `No service alerts found matching "${filterText}"`
                  : environmentFilter !== "all" && !filterText
                    ? `No service alerts found for ${environmentFilter} environment`
                    : environmentFilter !== "all" && filterText
                      ? `No service alerts found for ${environmentFilter} environment matching "${filterText}"`
                      : "No service alerts found"}
              </div>
            )}
          </div>
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
