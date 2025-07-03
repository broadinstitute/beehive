import type { SerializeFrom } from "@remix-run/node";
import type { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock";

export const ListServiceAlertButtonText: React.FunctionComponent<{
  serviceAlert: SerializeFrom<SherlockServiceAlertV3>;
}> = ({ serviceAlert }) => (
  <div className="flex flex-col space-y-1">
    <h2 className="font-light">
      <span className="font-medium">
        {serviceAlert.title || `Service Alert ${serviceAlert.id}`}
      </span>
    </h2>
    <div className="text-sm text-color-body-text">
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
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
      {serviceAlert.onEnvironment && (
        <span className="ml-2">• {serviceAlert.onEnvironment}</span>
      )}
    </div>
  </div>
);
