import { SerializeFrom } from "@remix-run/node";
import { V2controllersChart } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { AppVersionColors } from "../app-version/app-version-colors";
import { ChartReleaseColors } from "../chart-release/chart-release-colors";
import { ChartVersionColors } from "../chart-version/chart-version-colors";
import { MutateControls } from "../helpers";
import { ChartColors } from "./chart-colors";

export interface ChartDetailsProps {
  chart: V2controllersChart | SerializeFrom<V2controllersChart>;
  toChartVersions?: string;
  toAppVersions?: string;
  toChartReleases?: string;
  toEdit?: string;
  toDelete?: string;
}

export const ChartDetails: React.FunctionComponent<ChartDetailsProps> = ({
  chart,
  toChartVersions,
  toAppVersions,
  toChartReleases,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    {chart.appImageGitRepo && (
      <div className="flex flex-col space-y-2">
        <p>This Helm Chart deploys a specific application:</p>
        <a
          href={`https://github.com/${chart.appImageGitRepo}`}
          className="font-light text-4xl decoration-color-link-underline underline text-color-header-text"
        >
          {chart.appImageGitRepo}
        </a>
        {chart.appImageGitMainBranch && (
          <p>
            The app's stable branch is{" "}
            <a
              href={`https://github.com/${chart.appImageGitRepo}/tree/${chart.appImageGitMainBranch}`}
              className="font-mono decoration-color-link-underline underline"
            >
              {chart.appImageGitMainBranch}
            </a>
            .
          </p>
        )}
        {toAppVersions && (
          <NavButton to={toAppVersions} {...AppVersionColors}>
            <h2>View App Versions</h2>
          </NavButton>
        )}
      </div>
    )}

    {chart.legacyConfigsEnabled && (
      <p>
        This application is flagged as receiving legacy configuration from{" "}
        <a
          href="https://github.com/broadinstitute/firecloud-develop"
          className="decoration-color-link-underline underline"
        >
          firecloud-develop
        </a>
        .
      </p>
    )}

    <div className="flex flex-col space-y-2">
      {(chart.chartRepo == "terra-helm" && (
        <div className="flex flex-col space-y-2">
          <p>This Helm Chart's source code is managed by DevOps:</p>
          <a
            href={`https://github.com/broadinstitute/terra-helmfile/tree/master/charts/${chart.name}`}
            className="font-light text-4xl decoration-color-link-underline underline text-color-header-text"
          >
            broadinstitute/terra-helmfile
          </a>
          <p>
            The <span className="font-mono">latest</span> version is updated
            automatically upon merges to{" "}
            <a
              href={`https://github.com/broadinstitute/terra-helmfile/tree/master/charts/${chart.name}`}
              className="font-mono decoration-color-link-underline underline"
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
        <NavButton to={toChartVersions} {...ChartVersionColors}>
          <h2>View Chart Versions</h2>
        </NavButton>
      )}
    </div>
    {toChartReleases && (
      <NavButton to={toChartReleases} {...ChartReleaseColors}>
        <h2>View Instances of This Chart</h2>
      </NavButton>
    )}
    {chart.appImageGitRepo && (
      <a
        href={`https://grafana.dsp-devops.broadinstitute.org/d/oyhJF6t4k/v2-accelerate-metrics-per-app?&var-chart=${chart.name}`}
        target="_blank"
        className="underline decoration-color-link-underline w-fit"
      >
        View Accelerate Metrics in Grafana ↗
      </a>
    )}
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
