import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartVersionV3 } from "@sherlock-js-client/sherlock";

export function matchChartVersion(
  chartVersion: SerializeFrom<SherlockChartVersionV3>,
  matchText: string,
): boolean {
  return chartVersion.chartVersion?.includes(matchText) || false;
}
