import { V2controllersChart } from "@sherlock-js-client/sherlock";
import React from "react";
import { NavButton } from "~/components/interactivity/nav-button";
import { AppVersionColors } from "./app-version";
import { ChartVersionColors } from "./chart-version";
import { DataTypeColors, MutateControls } from "./helpers";

export const ChartColors: DataTypeColors = {
  borderClassName: "border-sky-300",
  backgroundClassName: "bg-sky-50",
};

export interface ChartDetailsProps {
  chart: V2controllersChart;
  toChartVersions?: string | undefined;
  toAppVersions?: string | undefined;
  toEdit?: string | undefined;
  toDelete?: string | undefined;
}

export const ChartDetails: React.FunctionComponent<ChartDetailsProps> = ({
  chart,
  toChartVersions,
  toAppVersions,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    {chart.appImageGitRepo && (
      <div className="flex flex-col space-y-2">
        <p>This Helm Chart deploys a specific application:</p>
        <a
          href={`https://github.com/${chart.appImageGitRepo}`}
          className="text-2xl font-medium decoration-blue-500 underline"
        >
          {chart.appImageGitRepo}
        </a>
        {chart.appImageGitMainBranch && (
          <p>
            The app's stable branch is{" "}
            <a
              href={`https://github.com/${chart.appImageGitRepo}/tree/${chart.appImageGitMainBranch}`}
              className="font-mono decoration-blue-500 underline"
            >
              {chart.appImageGitMainBranch}
            </a>
            .
          </p>
        )}
        {toAppVersions && (
          <NavButton
            to={toAppVersions}
            sizeClassName="w-[29vw]"
            {...AppVersionColors}
          >
            <h2>View App Versions</h2>
          </NavButton>
        )}
      </div>
    )}

    <div className="flex flex-col space-y-2">
      {chart.chartRepo == "terra-helm" && (
        <div className="flex flex-col space-y-2">
          <p>This Helm Chart's source code is managed by DevOps:</p>
          <a
            href={`https://github.com/broadinstitute/terra-helmfile/charts/${chart.name}`}
            className="text-2xl font-medium decoration-blue-500 underline"
          >
            broadinstitute/terra-helmfile
          </a>
          <p>
            The <span className="font-mono">latest</span> version is updated
            upon merges to{" "}
            <a
              href={`https://github.com/broadinstitute/terra-helmfile/tree/master/charts/${chart.name}`}
              className="font-mono decoration-blue-500 underline"
            >
              master
            </a>
            .
          </p>
        </div>
      )}
      {toChartVersions && (
        <NavButton
          to={toChartVersions}
          sizeClassName="w-[29vw]"
          {...ChartVersionColors}
        >
          <h2>View Chart Versions</h2>
        </NavButton>
      )}
    </div>
    {(toEdit || toDelete) && (
      <MutateControls
        name={chart.name || ""}
        colors={ChartColors}
        toEdit={toEdit}
        toDelete={toDelete}
      />
    )}
  </div>
);
