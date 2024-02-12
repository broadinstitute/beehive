import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";

export const ListChartReleaseButtonText: React.FunctionComponent<{
  chartRelease: SerializeFrom<SherlockChartReleaseV3>;
  showDestination?: "auto" | "cluster" | "none";
  showVersion?: "app" | "chart" | "none";
}> = ({ chartRelease, showVersion = "app", showDestination }) => {
  let title: React.ReactNode;
  if (showDestination && showDestination !== "none") {
    if (
      chartRelease.destinationType === "cluster" ||
      showDestination === "cluster"
    ) {
      title = (
        <span>
          Cluster:{" "}
          <span className="font-medium">{`${chartRelease.cluster} / ${chartRelease.namespace}`}</span>{" "}
          / {chartRelease.chart}
        </span>
      );
    } else if (chartRelease.destinationType === "environment") {
      title = (
        <span>
          Environment:{" "}
          <span className="font-medium">{chartRelease.environment}</span> /{" "}
          {chartRelease.chart}
        </span>
      );
    }
  } else {
    title = <span className="font-medium">{chartRelease.name}</span>;
  }
  return (
    <h2 className="font-light">
      {title}
      {showVersion === "app" &&
        chartRelease.appVersionResolver !== "none" &&
        ` (app @ ${chartRelease.appVersionExact})`}
      {showVersion === "chart" &&
        ` (chart @ ${chartRelease.chartVersionExact})`}
    </h2>
  );
};
