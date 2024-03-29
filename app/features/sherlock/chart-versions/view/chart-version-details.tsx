import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartVersionV3 } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { ChartLinkChip } from "../../charts/chart-link-chip";
import { CiRunResourceStatusWidget } from "../../ci/view/ci-run-resource-status-button";
import { MutateControls } from "../../mutate-controls";
import { ChartVersionColors } from "../chart-version-colors";

export interface ChartVersionDetailsProps {
  chartVersion: SherlockChartVersionV3 | SerializeFrom<SherlockChartVersionV3>;
  initialCiRuns?: React.ComponentProps<
    typeof CiRunResourceStatusWidget
  >["initialCiRuns"];
  toEdit?: string;
  toTimeline?: string;
}

export const ChartVersionDetails: React.FunctionComponent<
  ChartVersionDetailsProps
> = ({ chartVersion, initialCiRuns, toEdit, toTimeline }) => (
  <div className="flex flex-col space-y-10">
    <div className="flex flex-row gap-3 flex-wrap">
      {chartVersion.chart && <ChartLinkChip chart={chartVersion.chart} />}
    </div>
    <CiRunResourceStatusWidget
      ciIdentifier={
        chartVersion.ciIdentifier?.id || `chart-version/${chartVersion.id}`
      }
      initialCiRuns={initialCiRuns}
    />
    <p>
      Description:{" "}
      {chartVersion.description ? (
        <PrettyPrintDescription
          description={chartVersion.description}
          repo={
            chartVersion.chartInfo?.chartRepo
              ? "broadinstitute/terra-helmfile"
              : undefined
          }
        />
      ) : (
        "None"
      )}
    </p>
    {toTimeline && (
      <NavButton to={toTimeline} {...ChartVersionColors}>
        Deployment Timeline
      </NavButton>
    )}
    {chartVersion.parentChartVersion &&
      chartVersion.parentChartVersionInfo &&
      chartVersion.parentChartVersionInfo.hasOwnProperty("chartVersion") && (
        <div className="flex flex-col space-y-2">
          <p>
            Sherlock has{" "}
            <span className="font-mono">{chartVersion.parentChartVersion}</span>{" "}
            recorded as this version's "parent."
          </p>
          <p>
            This generally means that DevOps's systems will place this{" "}
            <span className="font-mono">{chartVersion.chartVersion}</span> as
            coming after{" "}
            <span className="font-mono">
              {
                (chartVersion.parentChartVersionInfo as SherlockChartVersionV3)
                  .chartVersion
              }
            </span>{" "}
            wherever applicable, like for calculcating version diffs.
          </p>
          <NavButton
            to={`../${
              (chartVersion.parentChartVersionInfo as SherlockChartVersionV3)
                .chartVersion
            }`}
            {...ChartVersionColors}
          >
            Jump to Parent
          </NavButton>
        </div>
      )}
    <p>
      This Chart Version was first recorded in Sherlock at{" "}
      <PrettyPrintTime time={chartVersion.createdAt} />.
    </p>
    {toEdit && (
      <MutateControls
        name={`${chartVersion.chart}/${chartVersion.chartVersion}`}
        colors={ChartVersionColors}
        toEdit={toEdit}
      />
    )}
  </div>
);
