import { SerializeFrom } from "@remix-run/node";
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

    // show permanent assignments first, sorted by user email
    if (a.expiresAt === undefined && b.expiresAt === undefined) {
      return userSorter(au, bu);
    }
    if (a.expiresAt !== undefined && b.expiresAt === undefined) {
      return -1;
    }
    if (a.expiresAt === undefined && b.expiresAt !== undefined) {
      return 1;
    }

    // show current user's break glass assignments first
    if (au.email === emailToComeFirst) {
      return -1;
    }
    if (bu.email === emailToComeFirst) {
      return 1;
    }

    // show all other break glass assignments, sorted by expiry
    if (a.expiresAt! < b.expiresAt!) {
      return -1;
    }
    if (a.expiresAt! > b.expiresAt!) {
      return 1;
    }

    // this will never happen (two break glasses that expire at the same time?)
    // but if it does, sort by user email
    return userSorter(au, bu);
  };
}
