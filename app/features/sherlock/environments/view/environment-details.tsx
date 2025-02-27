import type { SerializeFrom } from "@remix-run/node";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";
import { TerraIcon } from "~/components/assets/terra-icon";
import { DatarepoIcon } from "~/components/assets/datarepo-icon";
import { DuosIcon } from "~/components/assets/duos-icon";
import { ExternalNavButton } from "~/components/interactivity/external-nav-button";
import { NavButton } from "~/components/interactivity/nav-button";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { ChartReleaseColors } from "../../chart-releases/chart-release-colors";
import { CiRunResourceStatusWidget } from "../../ci/view/ci-run-resource-status-button";
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
  environment: SherlockEnvironmentV3 | SerializeFrom<SherlockEnvironmentV3>;
  initialCiRuns?: React.ComponentProps<
    typeof CiRunResourceStatusWidget
  >["initialCiRuns"];
  selfLinkChip?: boolean;
  linkChipArrows?: boolean;
  toTerraUI?: string | null;
  toDataRepoUI?: string | null;
  toDuos?: string | null;
  toChartReleases?: string;
  toChangeVersions?: string;
  toEdit?: string;
  toSchedule?: string;
  toLinkPagerduty?: string;
  toAdjustBulkUpdateDefaults?: string;
  toDelete?: string;
  toEditDeployHooks?: string;
}

export const EnvironmentDetails: React.FunctionComponent<
  EnvironmentDetailsProps
> = ({
  environment,
  initialCiRuns,
  selfLinkChip,
  linkChipArrows,
  toTerraUI,
  toDataRepoUI,
  toDuos,
  toChartReleases,
  toChangeVersions,
  toEdit,
  toSchedule,
  toLinkPagerduty,
  toAdjustBulkUpdateDefaults,
  toDelete,
  toEditDeployHooks,
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
      <CiRunResourceStatusWidget
        ciIdentifier={
          environment.ciIdentifier?.id || `environment/${environment.name}`
        }
        initialCiRuns={initialCiRuns}
      />
      {toChartReleases && (
        <NavButton to={toChartReleases} {...ChartReleaseColors}>
          <h2>View Charts in This Environment</h2>
        </NavButton>
      )}
      {toDuos && environment.offline !== true && (
        <ExternalNavButton
          icon={<DuosIcon className="h-[1.75rem]" />}
          to={toDuos}
          beforeBorderClassName="before:border-[#11a272]"
          target="_blank"
        >
          <h2>Visit DUOS ↗</h2>
        </ExternalNavButton>
      )}
      {toDataRepoUI && environment.offline !== true && (
        <ExternalNavButton
          icon={<DatarepoIcon className="h-[1.75rem]" />}
          to={toDataRepoUI}
          beforeBorderClassName="before:border-[#00d3ef]"
          target="_blank"
        >
          <h2>Visit Terra Data Repo ↗</h2>
        </ExternalNavButton>
      )}
      {toTerraUI && environment.offline !== true && (
        <ExternalNavButton
          icon={<TerraIcon className="h-[1.75rem]" />}
          to={toTerraUI}
          beforeBorderClassName="before:border-[#73ad43]"
          target="_blank"
        >
          <h2>Visit Terra UI ↗</h2>
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
              rel="noreferrer"
            >
              <b className="font-medium">New!</b> View Logs in Kibana ↗
            </a>
          )}
        <a
          href={`https://argocd.dsp-devops-prod.broadinstitute.org/applications?namespace=${environment.defaultNamespace}&showFavorites=false&proj=&sync=&health=&cluster=&labels=`}
          target="_blank"
          className="underline decoration-color-link-underline w-fit"
          rel="noreferrer"
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
              rel="noreferrer"
            >
              View in Google Cloud Platform ↗
            </a>
          )}
        {environment.lifecycle === "static" && (
          <a
            href={`https://grafana.dsp-devops.broadinstitute.org/d/Uh_BPk2Vz/v2-accelerate-metrics-per-environment?var-environment=${environment.name}`}
            target="_blank"
            className="underline decoration-color-link-underline w-fit"
            rel="noreferrer"
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
      toAdjustBulkUpdateDefaults ||
      toEditDeployHooks) && (
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
        toEditDeployHooks={toEditDeployHooks}
      />
    )}
  </div>
);
