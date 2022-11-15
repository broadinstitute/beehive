import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { AppVersionSummary } from "../app-version/app-version-summary";
import { ChartVersionSummary } from "../chart-version/chart-version-summary";
import { MutateControls } from "../helpers";
import { ChartReleaseColors } from "./chart-release-colors";

export interface ChartReleaseDetailsProps {
  chartRelease: V2controllersChartRelease;
  toChangeVersions?: string;
  toEdit?: string;
  toDelete?: string;
}

export const ChartReleaseDetails: React.FunctionComponent<
  ChartReleaseDetailsProps
> = ({ chartRelease, toChangeVersions, toEdit, toDelete }) => (
  <div className="flex flex-col space-y-10">
    {chartRelease.appVersionResolver &&
      chartRelease.appVersionResolver != "none" && (
        <AppVersionSummary
          chartName={chartRelease.chart}
          appImageGitRepo={chartRelease.chartInfo?.appImageGitRepo}
          appVersionResolver={chartRelease.appVersionResolver}
          appVersionExact={chartRelease.appVersionExact}
          appVersionCommit={chartRelease.appVersionCommit}
          appVersionBranch={chartRelease.appVersionBranch}
          firecloudDevelopRef={
            chartRelease.chartInfo?.legacyConfigsEnabled
              ? chartRelease.firecloudDevelopRef
              : undefined
          }
          renderAppVersionLink={chartRelease.appVersionReference != null}
        />
      )}
    <ChartVersionSummary
      chartName={chartRelease.chart}
      chartVersionResolver={chartRelease.chartVersionResolver}
      chartVersionExact={chartRelease.chartVersionExact}
      helmfileRef={chartRelease.helmfileRef}
      renderChartVersionLink={chartRelease.chartVersionReference != null}
    />
    {(toEdit || toDelete || toChangeVersions) && (
      <MutateControls
        name={chartRelease.name || ""}
        colors={ChartReleaseColors}
        toChangeVersions={toChangeVersions}
        toEdit={toEdit}
        toDelete={toDelete}
      />
    )}
  </div>
);
