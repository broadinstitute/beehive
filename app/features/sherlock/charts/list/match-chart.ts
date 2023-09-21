import { SerializeFrom } from "@remix-run/node";
import { SherlockChartV3 } from "@sherlock-js-client/sherlock";

export function matchChart(
  chart: SerializeFrom<SherlockChartV3>,
  matchText: string,
): boolean {
  return (
    chart.name?.includes(matchText) ||
    chart.chartRepo?.includes(matchText) ||
    false
  );
}
