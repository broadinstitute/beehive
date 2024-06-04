import type { SerializeFrom } from "@remix-run/node";
import { SherlockRoleV3, SherlockUserV3 } from "@sherlock-js-client/sherlock";

export function selfUserCanBreakGlassIntoRole(
  selfUserEmail: string,
  role: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>,
  roles: Array<SherlockRoleV3> | Array<SerializeFrom<SherlockRoleV3>>,
): boolean {
  if (!role.canBeGlassBrokenByRole) {
    return false;
  }
  const breakGlassRole = roles.find(
    (r) => r.id === role.canBeGlassBrokenByRole,
  );
  if (breakGlassRole === undefined) {
    return false;
  }
  return (
    breakGlassRole.assignments?.some(
      (a) => (a.userInfo as SherlockUserV3).email === selfUserEmail,
    ) || false
  );
}
