import { SerializeFrom } from "@remix-run/node";
import { SherlockChartV3 } from "@sherlock-js-client/sherlock";
import { ChartDetails } from "./chart-details";

export const AppPopoverContents: React.FunctionComponent<{
  chart: SerializeFrom<SherlockChartV3>;
}> = ({ chart }) => (
  <>
    <h2 className="font-light text-4xl text-color-header-text">
      Information for <b className="font-semibold">{chart.name}</b>
    </h2>
    <ChartDetails
      chart={chart}
      phraseAsApp
      toAppVersions={`/charts/${chart.name}/app-versions`}
      toChartVersions={`/charts/${chart.name}/chart-versions`}
    />
  </>
);
