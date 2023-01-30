import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartVersion } from "@sherlock-js-client/sherlock";

export function matchChartVersion(
  chartVersion: SerializeFrom<V2controllersChartVersion>,
  matchText: string
): boolean {
  return chartVersion.chartVersion?.includes(matchText) || false;
}
