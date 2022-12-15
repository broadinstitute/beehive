import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { ChartReleaseColors } from "../chart-release/chart-release-colors";
import { ClusterColors } from "../cluster/cluster-colors";
import { MutateControls, ProdWarning } from "../helpers";
import { EnvironmentColors } from "./environment-colors";

export interface EnvironmentDetailsProps {
  environment:
    | V2controllersEnvironment
    | SerializeFrom<V2controllersEnvironment>;
  toChartReleases?: string;
  toChangeVersions?: string;
  toEdit?: string;
  toDelete?: string;
}

export const EnvironmentDetails: React.FunctionComponent<
  EnvironmentDetailsProps
> = ({ environment, toChartReleases, toChangeVersions, toEdit, toDelete }) => (
  <div className="flex flex-col space-y-10">
    {(environment.name === "prod" ||
      toChartReleases ||
      environment.templateEnvironment ||
      environment.defaultCluster) && (
      <div className="flex flex-col space-y-4">
        {environment.name === "prod" && <ProdWarning name={environment.name} />}
        {toChartReleases && (
          <NavButton to={toChartReleases} {...ChartReleaseColors}>
            <h2>View Charts in This Environment</h2>
          </NavButton>
        )}
        {environment.templateEnvironment && (
          <NavButton
            to={`../${environment.templateEnvironment}`}
            {...EnvironmentColors}
          >
            <h2>Jump to Template</h2>
          </NavButton>
        )}
        {environment.defaultCluster && (
          <NavButton
            to={`/clusters/${environment.defaultCluster}`}
            {...ClusterColors}
          >
            <h2>Jump to Default Cluster</h2>
          </NavButton>
        )}
      </div>
    )}
    {environment.description && (
      <h3 className="text-2xl text-color-header-text">
        <PrettyPrintDescription description={environment.description} />
      </h3>
    )}
    {environment.lifecycle !== "template" && environment.defaultNamespace && (
      <div className="flex flex-col space-y-4">
        <a
          href={`https://ap-argocd.dsp-devops.broadinstitute.org/applications?namespace=${environment.defaultNamespace}`}
          target="_blank"
          className="underline decoration-color-link-underline w-fit"
        >
          View in Argo CD ↗
        </a>
        {environment.defaultCluster &&
          environment.defaultClusterInfo?.provider === "google" &&
          environment.defaultClusterInfo.googleProject && (
            <a
              href={`https://console.cloud.google.com/kubernetes/workload/overview?project=${environment.defaultClusterInfo.googleProject}&pageState=("savedViews":("c":%5B"gke%2Fus-central1-a%2F${environment.defaultCluster}"%5D,"n":%5B"${environment.defaultNamespace}"%5D))`}
              target="_blank"
              className="underline decoration-color-link-underline w-fit"
            >
              View in Google Cloud Platform ↗
            </a>
          )}
      </div>
    )}
    {(toEdit || toDelete || toChangeVersions) && (
      <MutateControls
        name={environment.name || ""}
        colors={EnvironmentColors}
        toChangeVersions={toChangeVersions}
        toChangeVersionsText="Monolith / Bulk Version Update"
        changeVersionText="Here you can do a bulk update of versions from another environment. If you want to update just one service or chart, view the charts in this environment and select the one you'd like to change."
        toEdit={toEdit}
        toDelete={environment.preventDeletion !== true ? toDelete : undefined}
      />
    )}
  </div>
);
