import type { SerializeFrom } from "@remix-run/node";
import type { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock";

export const ListRoleButtonText: React.FunctionComponent<{
  serviceAlert: SerializeFrom<SherlockServiceAlertV3>;
}> = ({ serviceAlert }) => (
  <h2 className="font-light">
    <span className="font-medium">{serviceAlert.id}</span>
    <span className="font-medium">{serviceAlert.title}</span>
  </h2>
);
