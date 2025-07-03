import type { SerializeFrom } from "@remix-run/node";
import type { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock";
import { ExternalNavButton } from "~/components/interactivity/external-nav-button";
import { NavButton } from "~/components/interactivity/nav-button";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { MutateControls } from "../../mutate-controls";
import { ProdWarning } from "../../prod-warning";
import { ServiceAlertColors } from "../service-alert-colors";

export interface ServiceAlertDetailsProps {
  serviceAlert: SherlockServiceAlertV3 | SerializeFrom<SherlockServiceAlertV3>;
  toEdit?: string;
  toDelete?: string;
}

export const ServiceAlertDetails: React.FunctionComponent<
  ServiceAlertDetailsProps
> = ({ serviceAlert, toEdit, toDelete }) => (
  <div className="flex flex-col space-y-4">
    <div className="flex flex-col space-y-10">
      <div className="flex flex-row items-center flex-wrap gap-4">
        <h2 className="text-2xl font-light">
          Service Alert {serviceAlert.uuid || serviceAlert.id}
        </h2>
        {toEdit && (
          <NavButton to={toEdit} {...ServiceAlertColors}>
            Edit
          </NavButton>
        )}
        {toDelete && (
          <NavButton to={toDelete} {...ServiceAlertColors}>
            Delete
          </NavButton>
        )}
      </div>

      <ProdWarning name={serviceAlert.title} />

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-xl font-medium">Title</h3>
          <p className="text-color-body-text">
            {serviceAlert.title || "No title specified"}
          </p>
        </div>

        {serviceAlert.message && (
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-medium">Message</h3>
            <PrettyPrintDescription
              description={serviceAlert.message}
              className="text-color-body-text"
            />
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <h3 className="text-xl font-medium">Severity</h3>
          <p className="text-color-body-text">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                serviceAlert.severity === "blocker"
                  ? "bg-red-100 text-red-800"
                  : serviceAlert.severity === " critical"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {serviceAlert.severity?.trim().charAt(0).toUpperCase() +
                serviceAlert.severity?.trim().slice(1) || "Minor"}
            </span>
          </p>
        </div>

        {serviceAlert.link && (
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-medium">Link</h3>
            <ExternalNavButton to={serviceAlert.link} {...ServiceAlertColors}>
              View Details
            </ExternalNavButton>
          </div>
        )}

        {serviceAlert.onEnvironment && (
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-medium">Environment</h3>
            <p className="text-color-body-text">{serviceAlert.onEnvironment}</p>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <h3 className="text-xl font-medium">Metadata</h3>
          <div className="text-color-body-text space-y-1">
            {serviceAlert.id && <p>ID: {serviceAlert.id}</p>}
            {serviceAlert.uuid && <p>UUID: {serviceAlert.uuid}</p>}
            {serviceAlert.createdAt && (
              <p>
                Created: {new Date(serviceAlert.createdAt).toLocaleString()}
              </p>
            )}
            {serviceAlert.updatedAt && (
              <p>
                Updated: {new Date(serviceAlert.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

    <MutateControls
      name={serviceAlert.title || `Service Alert ${serviceAlert.id}`}
      colors={ServiceAlertColors}
      toEdit={toEdit}
      toDelete={toDelete}
    />
  </div>
);
