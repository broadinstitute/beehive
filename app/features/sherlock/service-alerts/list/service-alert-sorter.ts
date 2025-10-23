import type { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock";

export function serviceAlertSorter(
  a: SherlockServiceAlertV3,
  b: SherlockServiceAlertV3,
): number {
  return (a.uuid || "").localeCompare(b.uuid || "");
}
