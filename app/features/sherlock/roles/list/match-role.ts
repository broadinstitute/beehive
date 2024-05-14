import type { SerializeFrom } from "@remix-run/node";
import { SherlockRoleV3 } from "@sherlock-js-client/sherlock/dist/models/SherlockRoleV3";

export function matchRole(
  role: SerializeFrom<SherlockRoleV3>,
  matchText: string,
): boolean {
  return role.name?.includes(matchText) || false;
}
