import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";

export function matchChartRelease(
  chartRelease: SerializeFrom<V2controllersChartRelease>,
  matchText: string
): boolean {
  return (
    chartRelease.name?.includes(matchText) ||
    chartRelease.chart?.includes(matchText) ||
    chartRelease.cluster?.includes("matchText") ||
    chartRelease.environment?.includes("matchText") ||
    false
  );
}
