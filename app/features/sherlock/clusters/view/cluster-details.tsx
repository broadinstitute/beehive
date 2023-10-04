import type { SerializeFrom } from "@remix-run/node";
import type { SherlockClusterV3 } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { ChartReleaseColors } from "../../chart-releases/chart-release-colors";
import { CiRunResourceStatusWidget } from "../../ci/view/ci-run-resource-status-button";
import { MutateControls } from "../../mutate-controls";
import { ProdWarning } from "../../prod-warning";
import { ClusterColors } from "../cluster-colors";

export interface ClusterDetailsProps {
  cluster: SherlockClusterV3 | SerializeFrom<SherlockClusterV3>;
  initialCiRuns?: React.ComponentProps<
    typeof CiRunResourceStatusWidget
  >["initialCiRuns"];
  toChartReleases?: string;
  toEdit?: string;
  toDelete?: string;
}

export const ClusterDetails: React.FunctionComponent<ClusterDetailsProps> = ({
  cluster,
  initialCiRuns,
  toChartReleases,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    {cluster.name === "terra-prod" && <ProdWarning name={cluster.name} />}
    <CiRunResourceStatusWidget
      ciIdentifier={cluster.ciIdentifier?.id || `cluster/${cluster.id}`}
      initialCiRuns={initialCiRuns}
    />
    {toChartReleases && (
      <NavButton to={toChartReleases} {...ChartReleaseColors}>
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
