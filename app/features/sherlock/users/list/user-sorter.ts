import { V2controllersUser } from "@sherlock-js-client/sherlock";

export function makeUserSorter(
  emailToComeFirst?: string | null
): (a: V2controllersUser, b: V2controllersUser) => number {
  return (a, b) => {
    if (a.email === emailToComeFirst) {
      return -1;
    } else if (b.email === emailToComeFirst) {
      return 1;
    } else {
      return (a.name || a.email || "").localeCompare(b.name || b.email || "");
    }
  };
}
