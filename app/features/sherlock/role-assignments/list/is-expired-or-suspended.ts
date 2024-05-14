import type { SerializeFrom } from "@remix-run/node";
import { SherlockRoleAssignmentV3 } from "@sherlock-js-client/sherlock";

export function isRoleAssignmentExpired(
  roleAssn: SherlockRoleAssignmentV3 | SerializeFrom<SherlockRoleAssignmentV3>,
): boolean {
  if (!roleAssn.expiresAt) {
    return false;
  }
  return new Date(roleAssn.expiresAt) < new Date();
}

export function isRoleAssignmentExpiredOrSuspended(
  roleAssn: SherlockRoleAssignmentV3 | SerializeFrom<SherlockRoleAssignmentV3>,
): boolean {
  return roleAssn.suspended || isRoleAssignmentExpired(roleAssn);
}
