import { SerializeFrom } from "@remix-run/node";
import { V2controllersChart } from "@sherlock-js-client/sherlock";

export function matchChart(
  chart: SerializeFrom<V2controllersChart>,
  matchText: string
): boolean {
  return (
    chart.name?.includes(matchText) ||
    chart.chartRepo?.includes(matchText) ||
    false
  );
}
