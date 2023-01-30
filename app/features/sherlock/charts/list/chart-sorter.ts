import { V2controllersChart } from "@sherlock-js-client/sherlock";

export function chartSorter(
  a: V2controllersChart,
  b: V2controllersChart
): number {
  return (a.name || "").localeCompare(b.name || "");
}
