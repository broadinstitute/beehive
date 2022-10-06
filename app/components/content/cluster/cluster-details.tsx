import { V2controllersCluster } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { ChartReleaseColors } from "../chart-release/chart-release-colors";
import { MutateControls } from "../helpers";
import { ClusterColors } from "./cluster-colors";

export interface ClusterDetailsProps {
  cluster: V2controllersCluster;
  toChartReleases?: string;
  toEdit?: string;
  toDelete?: string;
}

export const ClusterDetails: React.FunctionComponent<ClusterDetailsProps> = ({
  cluster,
  toChartReleases,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    {toChartReleases && (
      <NavButton
        to={toChartReleases}
        sizeClassName="w-[29vw]"
        {...ChartReleaseColors}
      >
        <h2>View Charts in This Cluster</h2>
      </NavButton>
    )}
    {(toEdit || toDelete) && (
      <MutateControls
        name={cluster.name || ""}
        colors={ClusterColors}
        toEdit={toEdit}
        toDelete={toDelete}
      />
    )}
  </div>
);
