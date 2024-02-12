import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";

export function matchChartRelease(
  chartRelease: SerializeFrom<SherlockChartReleaseV3>,
  matchText: string,
): boolean {
  return (
    chartRelease.name?.includes(matchText) ||
    chartRelease.chart?.includes(matchText) ||
    chartRelease.cluster?.includes("matchText") ||
    chartRelease.environment?.includes("matchText") ||
    false
  );
}
