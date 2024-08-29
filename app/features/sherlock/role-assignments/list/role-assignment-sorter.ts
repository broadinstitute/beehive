import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockRoleAssignmentV3,
  SherlockUserV3,
} from "@sherlock-js-client/sherlock";
import { makeUserSorter } from "../../users/list/user-sorter";

export function makeRoleAssignmentSorterForUser(
  emailToComeFirst?: string | null,
): (
  a: SherlockRoleAssignmentV3 | SerializeFrom<SherlockRoleAssignmentV3>,
  b: SherlockRoleAssignmentV3 | SerializeFrom<SherlockRoleAssignmentV3>,
) => number {
  return (a, b) => {
    const userSorter = makeUserSorter(emailToComeFirst);

    const au = a.userInfo as SherlockUserV3;
    const bu = b.userInfo as SherlockUserV3;

    return userSorter(au, bu);
  };
}
