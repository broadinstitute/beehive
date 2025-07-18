import type { SerializeFrom } from "@remix-run/node";
import type { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock";
import { ProdWarning } from "~/features/sherlock/prod-warning";

export interface ServiceAlertDeleteDescriptionProps {
  serviceAlert: SherlockServiceAlertV3 | SerializeFrom<SherlockServiceAlertV3>;
  showEnvironmentWarning?: boolean;
}

export const ServiceAlertDeleteDescription: React.FunctionComponent<
  ServiceAlertDeleteDescriptionProps
> = ({ serviceAlert, showEnvironmentWarning = false }) => (
  <div className="flex flex-col space-y-4">
    {showEnvironmentWarning && <ProdWarning name="service alerts" />}

    <h2 className="text-2xl font-light">
      Are you sure you want to delete this service alert?
    </h2>
    <p>
      This will permanently remove the service alert "{serviceAlert.title}" and
      it will no longer be displayed in Terra environments.
    </p>
    <div className="bg-color-warning-bg border border-color-warning-border rounded-2xl p-4">
      <h3 className="text-lg font-medium text-color-warning-text">Warning</h3>
      <p className="text-color-warning-text">
        This action cannot be undone. Users will no longer see this service
        alert in the Terra UI.
      </p>
    </div>
    <div className="flex flex-col space-y-2">
      <h3 className="text-lg font-medium">Alert Details</h3>
      <div className="text-color-body-text space-y-1">
        <p>
          <strong>Title:</strong> {serviceAlert.title || "No title"}
        </p>
        <p>
          <strong>Severity:</strong> {serviceAlert.severity || "minor"}
        </p>
        {serviceAlert.onEnvironment && (
          <p>
            <strong>Environment:</strong> {serviceAlert.onEnvironment}
          </p>
        )}
        {serviceAlert.message && (
          <p>
            <strong>Message:</strong> {serviceAlert.message}
          </p>
        )}
      </div>
    </div>
  </div>
);
