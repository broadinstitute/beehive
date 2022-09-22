import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { ChartReleaseColors } from "./chart-release";
import { ClusterColors } from "./cluster";
import { DataTypeColors } from "./interfaces";

export const EnvironmentColors: DataTypeColors = {
  borderClassName: "border-amber-300",
  backgroundClassName: "bg-amber-50",
};

export interface EnvironmentDetailsProps {
  environment: V2controllersEnvironment;
  toChartReleases?: string | undefined;
  toEdit?: string | undefined;
  toDelete?: string | undefined;
}

export const EnvironmentDetails: React.FunctionComponent<
  EnvironmentDetailsProps
> = ({ environment, toChartReleases, toEdit, toDelete }) => (
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
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-light">Change {environment.name}:</h2>
        {toEdit && (
          <NavButton
            to={toEdit}
            sizeClassName="w-[29vw]"
            {...EnvironmentColors}
          >
            Edit
          </NavButton>
        )}
        {toDelete && (
          <NavButton
            to={toDelete}
            sizeClassName="w-[29vw]"
            {...EnvironmentColors}
          >
            Delete
          </NavButton>
        )}
      </div>
    )}
  </div>
);
