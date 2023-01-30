import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartVersion } from "@sherlock-js-client/sherlock";

export const ListChartVersionButtonText: React.FunctionComponent<{
  chartVersion: SerializeFrom<V2controllersChartVersion>;
}> = ({ chartVersion }) => (
  <h2 className="font-light">
    {`${chartVersion.chart} chart @ `}
    <span className="font-medium">{chartVersion.chartVersion}</span>
  </h2>
);
