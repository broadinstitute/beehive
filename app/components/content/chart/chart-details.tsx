import { V2controllersChart } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { AppVersionColors } from "../app-version/app-version-colors";
import { ChartVersionColors } from "../chart-version/chart-version-colors";
import { MutateControls } from "../helpers";
import { ChartColors } from "./chart-colors";

export interface ChartDetailsProps {
  chart: V2controllersChart;
  toChartVersions?: string;
  toAppVersions?: string;
  toEdit?: string;
  toDelete?: string;
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
          className="font-light text-4xl decoration-blue-500 underline"
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
      {(chart.chartRepo == "terra-helm" && (
        <div className="flex flex-col space-y-2">
          <p>This Helm Chart's source code is managed by DevOps:</p>
          <a
            href={`https://github.com/broadinstitute/terra-helmfile/charts/${chart.name}`}
            className="font-light text-4xl decoration-blue-500 underline"
          >
            broadinstitute/terra-helmfile
          </a>
          <p>
            The <span className="font-mono">latest</span> version is updated
            automatically upon merges to{" "}
            <a
              href={`https://github.com/broadinstitute/terra-helmfile/tree/master/charts/${chart.name}`}
              className="font-mono decoration-blue-500 underline"
            >
              master
            </a>
            .
          </p>
        </div>
      )) || (
        <p>
          This Helm Chart's source code isn't managed directly by DevOps, but we
          still track the versions we deploy in our systems.
        </p>
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
