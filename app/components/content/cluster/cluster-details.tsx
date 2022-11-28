import { V2controllersCluster } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { ChartReleaseColors } from "../chart-release/chart-release-colors";
import { MutateControls, ProdWarning } from "../helpers";
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
    {cluster.name === "terra-prod" && <ProdWarning name={cluster.name} />}
    {toChartReleases && (
      <NavButton
        to={toChartReleases}
        sizeClassName="w-[29vw]"
        {...ChartReleaseColors}
      >
        <h2>View Charts in This Cluster</h2>
      </NavButton>
    )}
    {cluster.provider && (
      <p>This cluster is based out of the {cluster.provider} cloud provider.</p>
    )}
    {cluster.googleProject && (
      <p>
        This cluster has an associated GCP project of "{cluster.googleProject}".
      </p>
    )}
    {cluster.azureSubscription && (
      <p>
        This cluster has an associated Azure subscription of "
        {cluster.azureSubscription}".
      </p>
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
