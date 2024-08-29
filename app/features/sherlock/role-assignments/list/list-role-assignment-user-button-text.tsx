import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockRoleAssignmentV3,
  SherlockUserV3,
} from "@sherlock-js-client/sherlock";
import { ListUserButtonText } from "../../users/list/list-user-button-text";

export const ListRoleAssignmentUserButtonText: React.FunctionComponent<{
  roleAssn: SerializeFrom<SherlockRoleAssignmentV3>;
}> = ({ roleAssn }) => {
  const userInfo = roleAssn.userInfo as SerializeFrom<SherlockUserV3>;

  return ListUserButtonText({ user: userInfo });
};
