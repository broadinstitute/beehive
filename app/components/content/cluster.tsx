import { V2controllersCluster } from "@sherlock-js-client/sherlock";
import { NavButton } from "../interactivity/nav-button";
import { ChartReleaseColors } from "./chart-release";
import { DataTypeColors, MutateControls } from "./helpers";

export const ClusterColors: DataTypeColors = {
  borderClassName: "border-green-300",
  backgroundClassName: "bg-green-50",
};

export const ClusterHelpCopy: React.FunctionComponent = () => (
  <>
    <p>
      We have a number of Kubernetes Clusters that we can deploy our Helm Charts
      to.
    </p>
    <p>
      Both Environments and Clusters "contain" instances of our charts, and
      there can be a lot of overlap. For example, an instance of Rawls deployed
      to the terra-prod environment would probably be deployed to the terra-prod
      cluster.
    </p>
    <p>
      There's also cases without overlap. A cluster might contain an instance of
      a chart that ends up getting shared across any environments in that
      cluster—meaning it wouldn't show up as being contained by any particular
      environment. Somewhat similarly, any charts in a template environment
      wouldn't show up as being inside any particular cluster, because template
      environments don't truly exist in our actual infrastructure.
    </p>
  </>
);

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
