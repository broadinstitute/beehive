import type { SherlockRoleV3 } from "@sherlock-js-client/sherlock";

export function roleSorter(a: SherlockRoleV3, b: SherlockRoleV3): number {
  return (a.name || "").localeCompare(b.name || "");
}
