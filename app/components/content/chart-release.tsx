import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { VersionSummary } from "~/components/logic/version-summary";
import { AppVersionSummary } from "./app-version";
import { ChangesetColors } from "./changeset";
import { ChartColors } from "./chart";
import { ChartVersionSummary } from "./chart-version";
import { MutateControls } from "./helpers";

export const ChartReleaseColors = ChartColors;

export interface ChartReleaseDetailsProps {
  chartRelease: V2controllersChartRelease;
  toChangesets?: string | undefined;
  toEdit?: string | undefined;
  toDelete?: string | undefined;
}

export const ChartReleaseDetails: React.FunctionComponent<
  ChartReleaseDetailsProps
> = ({ chartRelease, toChangesets, toEdit, toDelete }) => (
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
    {(toEdit || toDelete) && (
      <MutateControls
        name={chartRelease.name || ""}
        colors={ChartReleaseColors}
        toEdit={toEdit}
        toDelete={toDelete}
      />
    )}
  </div>
);
