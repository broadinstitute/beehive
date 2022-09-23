import { V2controllersChartVersion } from "@sherlock-js-client/sherlock";
import { NavButton } from "../interactivity/nav-button";
import { PrettyPrintTime } from "../logic/pretty-print-time";
import { DataTypeColors } from "./helpers";

export const ChartVersionColors: DataTypeColors = {
  borderClassName: "border-violet-300",
  backgroundClassName: "bg-violet-50",
};

export interface ChartVersionDetailsProps {
  chartVersion: V2controllersChartVersion;
}

export const ChartVersionDetails: React.FunctionComponent<
  ChartVersionDetailsProps
> = ({ chartVersion }) => (
  <div className="flex flex-col space-y-10">
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
                (
                  chartVersion.parentChartVersionInfo as V2controllersChartVersion
                ).chartVersion
              }
            </span>{" "}
            wherever chartlicable, like for calculcating version diffs.
          </p>
          <NavButton
            to={`../${
              (chartVersion.parentChartVersionInfo as V2controllersChartVersion)
                .chartVersion
            }`}
            sizeClassName="w-[29vw]"
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
  </div>
);
