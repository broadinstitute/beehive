import type { SerializeFrom } from "@remix-run/node";
import type { SherlockRoleV3 } from "@sherlock-js-client/sherlock";

export const ListRoleButtonText: React.FunctionComponent<{
  role: SerializeFrom<SherlockRoleV3>;
}> = ({ role }) => (
  <h2 className="font-light">
    <span className="font-medium">{role.name}</span>
  </h2>
);
