import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockRoleAssignmentV3,
  SherlockUserV3,
} from "@sherlock-js-client/sherlock";

export const ListRoleAssignmentUserButtonText: React.FunctionComponent<{
  roleAssn: SerializeFrom<SherlockRoleAssignmentV3>;
}> = ({ roleAssn }) => {
  const userInfo = roleAssn.userInfo as SherlockUserV3;

  return (
    <h2 className="font-light">
      <span className="font-medium">{userInfo.email}</span>
    </h2>
  );
};
