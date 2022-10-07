import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { ChartReleaseColors } from "../chart-release/chart-release-colors";
import { ClusterColors } from "../cluster/cluster-colors";
import { MutateControls } from "../helpers";
import { EnvironmentColors } from "./environment-colors";

export interface EnvironmentDetailsProps {
  environment: V2controllersEnvironment;
  toChartReleases?: string;
  toChangeVersions?: string;
  toEdit?: string;
  toDelete?: string;
}

export const EnvironmentDetails: React.FunctionComponent<
  EnvironmentDetailsProps
> = ({ environment, toChartReleases, toChangeVersions, toEdit, toDelete }) => (
  <div className="flex flex-col space-y-10">
    {(toChartReleases ||
      environment.templateEnvironment ||
      environment.defaultCluster) && (
      <div className="flex flex-col space-y-4">
        {toChartReleases && (
          <NavButton
            to={toChartReleases}
            sizeClassName="w-[29vw]"
            {...ChartReleaseColors}
          >
            <h2>View Charts in This Environment</h2>
          </NavButton>
        )}
        {environment.templateEnvironment && (
          <NavButton
            to={`../${environment.templateEnvironment}`}
            sizeClassName="w-[29vw]"
            {...EnvironmentColors}
          >
            <h2>Jump to Template</h2>
          </NavButton>
        )}
        {environment.defaultCluster && (
          <NavButton
            to={`/clusters/${environment.defaultCluster}`}
            sizeClassName="w-[29vw]"
            {...ClusterColors}
          >
            <h2>Jump to Default Cluster</h2>
          </NavButton>
        )}
      </div>
    )}
    {(toEdit || toDelete) && (
      <MutateControls
        name={environment.name || ""}
        colors={EnvironmentColors}
        toChangeVersions={toChangeVersions}
        toEdit={toEdit}
        toDelete={toDelete}
      />
    )}
  </div>
);
