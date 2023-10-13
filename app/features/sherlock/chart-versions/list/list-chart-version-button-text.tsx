import { SerializeFrom } from "@remix-run/node";
import { SherlockChartVersionV3 } from "@sherlock-js-client/sherlock";

export const ListChartVersionButtonText: React.FunctionComponent<{
  chartVersion: SerializeFrom<SherlockChartVersionV3>;
}> = ({ chartVersion }) => (
  <h2 className="font-light">
    {`${chartVersion.chart} chart @ `}
    <span className="font-medium">{chartVersion.chartVersion}</span>
  </h2>
);
