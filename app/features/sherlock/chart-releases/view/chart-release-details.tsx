import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { AppVersionSummary } from "../../app-versions/view/app-version-summary";
import { ChartVersionSummary } from "../../chart-versions/view/chart-version-summary";
import { ChartLinkChip } from "../../charts/chart-link-chip";
import {
  ClusterLinkChip,
  NamespaceLinkChip,
} from "../../clusters/cluster-link-chip";
import { EnvironmentLinkChip } from "../../environments/environment-link-chip";
import { MutateControls } from "../../mutate-controls";
import { PagerdutyIntegrationLinkChip } from "../../pagerduty-integrations/pagerduty-integration-link-chip";
import { ChartReleaseColors } from "../chart-release-colors";
import { ArgoLinkChip } from "../chart-release-link-chip";

export interface ChartReleaseDetailsProps {
  chartRelease:
    | V2controllersChartRelease
    | SerializeFrom<V2controllersChartRelease>;
  toChangeVersions?: string;
  toVersionHistory?: string;
  toEdit?: string;
  toLinkPagerduty?: string;
  toDelete?: string;
}

export const ChartReleaseDetails: React.FunctionComponent<
  ChartReleaseDetailsProps
> = ({
  chartRelease,
  toChangeVersions,
  toVersionHistory,
  toEdit,
  toLinkPagerduty,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    <div className="flex flex-row gap-3 flex-wrap">
      {chartRelease.chart && <ChartLinkChip chart={chartRelease.chart} />}
      {chartRelease.environment && (
        <EnvironmentLinkChip environment={chartRelease.environment} />
      )}
      {chartRelease.cluster && (
        <>
          <ClusterLinkChip cluster={chartRelease.cluster} />
          {chartRelease.namespace && (
            <NamespaceLinkChip
              cluster={chartRelease.cluster}
              namespace={chartRelease.namespace}
            />
          )}
        </>
      )}
      {chartRelease.environment &&
        chartRelease.pagerdutyIntegration &&
        chartRelease.pagerdutyIntegrationInfo?.name && (
          <PagerdutyIntegrationLinkChip
            to={`/trigger-incident/${chartRelease.environment}/chart-releases/${chartRelease.chart}`}
            pagerdutyIntegrationName={
              chartRelease.pagerdutyIntegrationInfo.name
            }
          />
        )}
      {chartRelease.name &&
        chartRelease.cluster &&
        chartRelease.environmentInfo?.lifecycle !== "template" && (
          <ArgoLinkChip chartReleaseName={chartRelease.name} />
        )}
    </div>
    {chartRelease.appVersionResolver &&
      chartRelease.appVersionResolver != "none" && (
        <AppVersionSummary
          chartName={chartRelease.chart}
          appImageGitRepo={chartRelease.chartInfo?.appImageGitRepo}
          appVersionResolver={chartRelease.appVersionResolver}
          appVersionExact={chartRelease.appVersionExact}
          appVersionFollowChartRelease={
            chartRelease.appVersionFollowChartRelease
          }
          appVersionCommit={chartRelease.appVersionCommit}
          appVersionBranch={chartRelease.appVersionBranch}
          firecloudDevelopRef={
            chartRelease.chartInfo?.legacyConfigsEnabled
              ? chartRelease.firecloudDevelopRef
              : undefined
          }
          renderAppVersionLink={chartRelease.appVersionReference != null}
        />
      )}
    <ChartVersionSummary
      chartName={chartRelease.chart}
      chartVersionResolver={chartRelease.chartVersionResolver}
      chartVersionExact={chartRelease.chartVersionExact}
      chartVersionFollowChartRelease={
        chartRelease.chartVersionFollowChartRelease
      }
      helmfileRef={chartRelease.helmfileRef}
      renderChartVersionLink={chartRelease.chartVersionReference != null}
    />
    {chartRelease.cluster &&
      chartRelease.environmentInfo?.lifecycle !== "template" && (
        <div className="flex flex-col space-y-4">
          {chartRelease.environmentInfo?.lifecycle === "dynamic" &&
            chartRelease.cluster === "terra-qa-bees" &&
            chartRelease.environmentInfo.defaultNamespace && (
              <a
                href={`https://kibana.bee.envs-terra.bio/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(message,kubernetes.deployment.name),filters:!(),index:filebeat-data-view,interval:auto,query:(language:kuery,query:'kubernetes.namespace:%22${chartRelease.environmentInfo.defaultNamespace}%22%20and%20kubernetes.labels.app_kubernetes_io%2Fname:%22${chartRelease.chart}%22'),sort:!(!('@timestamp',desc)))`}
                target="_blank"
                className="underline decoration-color-link-underline w-fit"
              >
                <b className="font-medium">New!</b> View Logs in Kibana ↗
              </a>
            )}
          <a
            href={`https://ap-argocd.dsp-devops.broadinstitute.org/applications/ap-argocd/${chartRelease.name}`}
            target="_blank"
            className="underline decoration-color-link-underline w-fit"
          >
            View in Argo CD ↗
          </a>
        </div>
      )}
    {(toEdit || toLinkPagerduty || toDelete || toChangeVersions) && (
      <MutateControls
        name={chartRelease.name || ""}
        colors={ChartReleaseColors}
        toChangeVersions={toChangeVersions}
        toVersionHistory={toVersionHistory}
        toEdit={toEdit}
        toLinkPagerduty={toLinkPagerduty}
        toDelete={toDelete}
      />
    )}
  </div>
);
