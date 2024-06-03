import type { SerializeFrom } from "@remix-run/node";
import {
  SherlockRoleAssignmentV3,
  SherlockUserV3,
} from "@sherlock-js-client/sherlock";

export function matchRoleAssignmentByUser(
  roleAssignment: SerializeFrom<SherlockRoleAssignmentV3>,
  matchText: string,
): boolean {
  const userInfo = roleAssignment.userInfo as SherlockUserV3;
  return (
    userInfo.name?.includes(matchText) ||
    userInfo.email?.includes(matchText) ||
    false
  );
}
