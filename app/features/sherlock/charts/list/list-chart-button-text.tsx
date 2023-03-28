import { SerializeFrom } from "@remix-run/node";
import { V2controllersChart } from "@sherlock-js-client/sherlock";

export const ListChartButtonText: React.FunctionComponent<{
  chart: SerializeFrom<V2controllersChart>;
  includeChartRepo?: boolean;
}> = ({ chart, includeChartRepo = true }) => (
  <h2 className="font-light">
    {includeChartRepo && `${chart.chartRepo} / `}
    <span className="font-medium">{chart.name}</span>
  </h2>
);
