import { V2controllersCluster } from "@sherlock-js-client/sherlock";
import { NavButton } from "../interactivity/nav-button";
import { ChartReleaseColors } from "./chart-release";
import { DataTypeColors, MutateControls } from "./helpers";

export const ClusterColors: DataTypeColors = {
  borderClassName: "border-green-300",
  backgroundClassName: "bg-green-50",
};

export interface ClusterDetailsProps {
  cluster: V2controllersCluster;
  toChartReleases?: string | undefined;
  toEdit?: string | undefined;
  toDelete?: string | undefined;
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
