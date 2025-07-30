import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { EnvironmentsApi, ServiceAlertApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { ProdFlag } from "~/components/layout/prod-flag";
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
    const url = new URL(request.url);
    const includeDeleted = url.searchParams.get("include-deleted") === "true";

    const serviceAlerts = await new ServiceAlertApi(SherlockConfiguration)
      .apiServiceAlertsV3Get({ includeDeleted }, handleIAP(request))
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get show deleted state from URL params
  const showDeleted = searchParams.get("include-deleted") === "true";

  // Determine if prod environment filter is active for theme switching
  const isProdFilterActive = environmentFilter === "prod";

  // Handler for show deleted toggle
  const handleShowDeletedChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === "true") {
      newSearchParams.set("include-deleted", "true");
    } else {
      newSearchParams.delete("include-deleted");
    }

    // If we're currently viewing a specific service alert, navigate back to the list
    // to avoid potential 404 errors when the filter changes
    if (currentPathServiceAlert) {
      const searchString = newSearchParams.toString();
      navigate(`/service-alerts${searchString ? `?${searchString}` : ""}`, {
        replace: true,
      });
    } else {
      setSearchParams(newSearchParams);
    }
  };

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
    <ProdFlag prod={isProdFilterActive}>
      <InsetPanel>
        <InteractiveList title="Service Alerts" {...ServiceAlertColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate={`./new${environmentFilter !== "all" ? `?environment=${environmentFilter}` : ""}`}
            {...ServiceAlertColors}
          />
          <EnvironmentFilterButtons />
          <div className="mb-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <span className="text-sm font-medium text-color-header-text">
                Include Deleted Alerts
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) =>
                    handleShowDeletedChange(e.target.checked ? "true" : "false")
                  }
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full shadow-inner transition-colors duration-200 ease-in-out ${
                    showDeleted
                      ? `${ServiceAlertColors.borderClassName.replace("border-", "bg-")}`
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${
                      showDeleted ? "transform translate-x-5" : ""
                    }`}
                  />
                </div>
              </div>
            </label>
          </div>
          <div className="flex flex-col space-y-4">
            {filteredServiceAlerts.length > 0 ? (
              filteredServiceAlerts.map((serviceAlert, index) => {
                const isDeleted = Boolean(serviceAlert.deletedBy);
                return (
                  <NavButton
                    to={`./${serviceAlert.id}${showDeleted ? "?include-deleted=true" : ""}`}
                    key={index.toString()}
                    forceActive={
                      currentPathServiceAlert === serviceAlert.id?.toString()
                    }
                    {...(isDeleted
                      ? {
                          borderClassName: "border-gray-300",
                          beforeBorderClassName: "before:border-gray-300",
                          backgroundClassName: "bg-gray-50",
                          hoverClassName: "hover:bg-gray-100",
                        }
                      : ServiceAlertColors)}
                  >
                    <ListServiceAlertButtonText
                      serviceAlert={serviceAlert}
                      environments={environments}
                    />
                  </NavButton>
                );
              })
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
    </ProdFlag>
  );
}

export function useServiceAlertsContext() {
  return useOutletContext<{
    serviceAlerts: SerializeFrom<typeof loader>["serviceAlerts"];
    environments: SerializeFrom<typeof loader>["environments"];
  }>();
}
