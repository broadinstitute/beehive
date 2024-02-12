import type { SherlockChartV3 } from "@sherlock-js-client/sherlock";

export function chartSorter(a: SherlockChartV3, b: SherlockChartV3): number {
  return (a.name || "").localeCompare(b.name || "");
}
