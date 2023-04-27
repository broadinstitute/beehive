import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { TerraIcon } from "~/components/assets/terra-icon";
import { ExternalNavButton } from "~/components/interactivity/external-nav-button";
import { NavButton } from "~/components/interactivity/nav-button";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { ChartReleaseColors } from "../../chart-releases/chart-release-colors";
import {
  ClusterLinkChip,
  NamespaceLinkChip,
} from "../../clusters/cluster-link-chip";
import { MutateControls } from "../../mutate-controls";
import { PagerdutyIntegrationLinkChip } from "../../pagerduty-integrations/pagerduty-integration-link-chip";
import { ProdWarning } from "../../prod-warning";
import { EnvironmentColors } from "../environment-colors";
import { EnvironmentLinkChip } from "../environment-link-chip";

export interface EnvironmentDetailsProps {
  environment:
    | V2controllersEnvironment
    | SerializeFrom<V2controllersEnvironment>;
  selfLinkChip?: boolean;
  linkChipArrows?: boolean;
  toTerraUI?: string | null;
  toChartReleases?: string;
  toChangeVersions?: string;
  toEdit?: string;
  toSchedule?: string;
  toLinkPagerduty?: string;
  toAdjustBulkUpdateDefaults?: string;
  toDelete?: string;
}

export const EnvironmentDetails: React.FunctionComponent<
  EnvironmentDetailsProps
> = ({
  environment,
  selfLinkChip,
  linkChipArrows,
  toTerraUI,
  toChartReleases,
  toChangeVersions,
  toEdit,
  toSchedule,
  toLinkPagerduty,
  toAdjustBulkUpdateDefaults,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    <div className="flex flex-col space-y-4">
      <div className="flex flex-row gap-3 flex-wrap pb-2">
        {selfLinkChip && environment.name && (
          <EnvironmentLinkChip
            environment={environment.name}
            arrow={linkChipArrows}
          />
        )}
        {environment.templateEnvironment && (
          <EnvironmentLinkChip
            environment={environment.templateEnvironment}
            arrow={linkChipArrows}
            justTemplate
          />
        )}
        {environment.defaultCluster && (
          <>
            <ClusterLinkChip
              cluster={environment.defaultCluster}
              arrow={linkChipArrows}
              justDefault
            />
            {environment.defaultNamespace &&
              environment.lifecycle != "template" && (
                <NamespaceLinkChip
                  cluster={environment.defaultCluster}
                  namespace={environment.defaultNamespace}
                  arrow={linkChipArrows}
                />
              )}
          </>
        )}
        {environment.pagerdutyIntegrationInfo?.name && (
          <PagerdutyIntegrationLinkChip
            to={`/trigger-incident/${environment.name}`}
            pagerdutyIntegrationName={environment.pagerdutyIntegrationInfo.name}
            arrow={linkChipArrows}
          />
        )}
      </div>
      {environment.name === "prod" && <ProdWarning name={environment.name} />}
      {toChartReleases && (
        <NavButton to={toChartReleases} {...ChartReleaseColors}>
          <h2>View Charts in This Environment</h2>
        </NavButton>
      )}
      {toTerraUI && (
        <ExternalNavButton
          icon={<TerraIcon className="h-[1.75rem]" />}
          to={toTerraUI}
          beforeBorderClassName="before:border-[#73ad43]"
        >
          <h2>Visit Terra UI</h2>
        </ExternalNavButton>
      )}
    </div>
    {environment.description && (
      <h3 className="text-2xl text-color-header-text">
        <PrettyPrintDescription description={environment.description} />
      </h3>
    )}
    {environment.lifecycle !== "template" && environment.defaultNamespace && (
      <div className="flex flex-col space-y-4">
        {environment.lifecycle === "dynamic" &&
          environment.defaultCluster === "terra-qa-bees" && (
            <a
              href={`https://kibana.bee.envs-terra.bio/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(message,kubernetes.deployment.name),filters:!(),index:filebeat-data-view,interval:auto,query:(language:kuery,query:'kubernetes.namespace:%22${environment.defaultNamespace}%22'),sort:!(!('@timestamp',desc)))`}
              target="_blank"
              className="underline decoration-color-link-underline w-fit"
            >
              <b className="font-medium">New!</b> View Logs in Kibana ↗
            </a>
          )}
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
    {(toEdit ||
      toSchedule ||
      toLinkPagerduty ||
      toDelete ||
      toChangeVersions ||
      toAdjustBulkUpdateDefaults) && (
      <MutateControls
        name={environment.name || ""}
        colors={EnvironmentColors}
        toChangeVersions={toChangeVersions}
        toChangeVersionsText="Monolith / Bulk Version Update"
        changeVersionText="Here you can do a bulk update of versions from another environment. If you want to update just one service or chart, view the charts in this environment and select the one you'd like to change."
        toEdit={toEdit}
        toSchedule={
          environment.lifecycle === "dynamic" &&
          environment.preventDeletion !== true
            ? toSchedule
            : undefined
        }
        toLinkPagerduty={toLinkPagerduty}
        toDelete={
          environment.lifecycle !== "static" &&
          environment.preventDeletion !== true
            ? toDelete
            : undefined
        }
        toAdjustBulkUpdateDefaults={toAdjustBulkUpdateDefaults}
      />
    )}
  </div>
);
