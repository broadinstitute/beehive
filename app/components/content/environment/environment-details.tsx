import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { ChartReleaseColors } from "../chart-release/chart-release-colors";
import {
  ClusterLinkChip,
  NamespaceLinkChip,
} from "../cluster/cluster-link-chip";
import { MutateControls, ProdWarning } from "../helpers";
import { PagerdutyIntegrationLinkChip } from "../pagerduty-integration/pagerduty-integration-link-chip";
import { EnvironmentColors } from "./environment-colors";
import { EnvironmentLinkChip } from "./environment-link-chip";

export interface EnvironmentDetailsProps {
  environment:
    | V2controllersEnvironment
    | SerializeFrom<V2controllersEnvironment>;
  toChartReleases?: string;
  toChangeVersions?: string;
  toEdit?: string;
  toLinkPagerduty?: string;
  toDelete?: string;
}

export const EnvironmentDetails: React.FunctionComponent<
  EnvironmentDetailsProps
> = ({
  environment,
  toChartReleases,
  toChangeVersions,
  toEdit,
  toLinkPagerduty,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row gap-3 flex-wrap pb-2">
        {environment.templateEnvironment && (
          <EnvironmentLinkChip
            environment={environment.templateEnvironment}
            justTemplate
          />
        )}
        {environment.defaultCluster && (
          <>
            <ClusterLinkChip cluster={environment.defaultCluster} justDefault />
            {environment.defaultNamespace &&
              environment.lifecycle != "template" && (
                <NamespaceLinkChip
                  cluster={environment.defaultCluster}
                  namespace={environment.defaultNamespace}
                />
              )}
          </>
        )}
        {environment.pagerdutyIntegrationInfo?.name && (
          <PagerdutyIntegrationLinkChip
            to={`/trigger-incident/${environment.name}`}
            pagerdutyIntegrationName={environment.pagerdutyIntegrationInfo.name}
          />
        )}
      </div>
      {environment.name === "prod" && <ProdWarning name={environment.name} />}
      {toChartReleases && (
        <NavButton to={toChartReleases} {...ChartReleaseColors}>
          <h2>View Charts in This Environment</h2>
        </NavButton>
      )}
    </div>
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
        {environment.lifecycle === "static" && (
          <a
            href={`https://grafana.dsp-devops.broadinstitute.org/d/Uh_BPk2Vz/v2-accelerate-metrics-per-environment?var-environment=${environment.name}`}
            target="_blank"
            className="underline decoration-color-link-underline w-fit"
          >
            View Accelerate Metrics in Grafana ↗
          </a>
        )}
      </div>
    )}
    {(toEdit || toLinkPagerduty || toDelete || toChangeVersions) && (
      <MutateControls
        name={environment.name || ""}
        colors={EnvironmentColors}
        toChangeVersions={toChangeVersions}
        toChangeVersionsText="Monolith / Bulk Version Update"
        changeVersionText="Here you can do a bulk update of versions from another environment. If you want to update just one service or chart, view the charts in this environment and select the one you'd like to change."
        toEdit={toEdit}
        toLinkPagerduty={toLinkPagerduty}
        toDelete={environment.preventDeletion !== true ? toDelete : undefined}
      />
    )}
  </div>
);
