import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { AppVersionSummary } from "../app-version/app-version-summary";
import { ChartVersionSummary } from "../chart-version/chart-version-summary";
import { ChartLinkChip } from "../chart/chart-link-chip";
import {
  ClusterLinkChip,
  NamespaceLinkChip,
} from "../cluster/cluster-link-chip";
import { EnvironmentLinkChip } from "../environment/environment-link-chip";
import { MutateControls } from "../helpers";
import { ChartReleaseColors } from "./chart-release-colors";

export interface ChartReleaseDetailsProps {
  chartRelease:
    | V2controllersChartRelease
    | SerializeFrom<V2controllersChartRelease>;
  toChangeVersions?: string;
  toVersionHistory?: string;
  toEdit?: string;
  toDelete?: string;
}

export const ChartReleaseDetails: React.FunctionComponent<
  ChartReleaseDetailsProps
> = ({
  chartRelease,
  toChangeVersions,
  toVersionHistory,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    <div className="flex flex-row gap-3 flex-wrap">
      {chartRelease.chart && <ChartLinkChip chart={chartRelease.chart} />}
      {chartRelease.environment && (
        <EnvironmentLinkChip environment={chartRelease.environment} />
      )}
      {chartRelease.cluster && (
        <>
          <ClusterLinkChip cluster={chartRelease.cluster} />
          {chartRelease.namespace && (
            <NamespaceLinkChip
              cluster={chartRelease.cluster}
              namespace={chartRelease.namespace}
            />
          )}
        </>
      )}
    </div>
    {chartRelease.appVersionResolver &&
      chartRelease.appVersionResolver != "none" && (
        <AppVersionSummary
          chartName={chartRelease.chart}
          appImageGitRepo={chartRelease.chartInfo?.appImageGitRepo}
          appVersionResolver={chartRelease.appVersionResolver}
          appVersionExact={chartRelease.appVersionExact}
          appVersionFollowChartRelease={
            chartRelease.appVersionFollowChartRelease
          }
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
      chartVersionFollowChartRelease={
        chartRelease.chartVersionFollowChartRelease
      }
      helmfileRef={chartRelease.helmfileRef}
      renderChartVersionLink={chartRelease.chartVersionReference != null}
    />
    {(toEdit || toDelete || toChangeVersions) && (
      <MutateControls
        name={chartRelease.name || ""}
        colors={ChartReleaseColors}
        toChangeVersions={toChangeVersions}
        toVersionHistory={toVersionHistory}
        toEdit={toEdit}
        toDelete={toDelete}
      />
    )}
  </div>
);
