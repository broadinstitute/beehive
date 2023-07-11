import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { ClusterLinkChip } from "../../clusters/cluster-link-chip";
import { EnvironmentLinkChip } from "../../environments/environment-link-chip";
import { PagerdutyIntegrationLinkChip } from "../../pagerduty-integrations/pagerduty-integration-link-chip";
import { ArgoLinkChip, ChartReleaseLinkChip } from "../chart-release-link-chip";
import { ChartReleaseDetails } from "./chart-release-details";

export const AppInstancePopoverContents: React.FunctionComponent<{
  chartRelease: SerializeFrom<V2controllersChartRelease>;
}> = ({ chartRelease }) => (
  <>
    <h2 className="font-light text-4xl text-color-header-text">
      Instance of <b className="font-semibold">{chartRelease.chart}</b> in{" "}
      <b className="font-semibold">{chartRelease.environment}</b>
    </h2>
    <div className="flex flex-row gap-3 flex-wrap pb-2">
      {chartRelease.name && chartRelease.chart && chartRelease.environment && (
        <ChartReleaseLinkChip
          chartRelease={chartRelease.name}
          chart={chartRelease.chart}
          environment={chartRelease.environment}
          arrow
        />
      )}
      {chartRelease.environment && (
        <EnvironmentLinkChip environment={chartRelease.environment} arrow />
      )}
      {chartRelease.cluster && (
        <ClusterLinkChip cluster={chartRelease.cluster} arrow />
      )}
      {chartRelease.environment &&
      chartRelease.chart &&
      chartRelease.pagerdutyIntegrationInfo?.name ? (
        <PagerdutyIntegrationLinkChip
          to={`/trigger-incident/${chartRelease.environment}/chart-releases/${chartRelease.chart}`}
          pagerdutyIntegrationName={chartRelease.pagerdutyIntegrationInfo?.name}
          arrow
        />
      ) : (
        chartRelease.environment &&
        chartRelease.environmentInfo?.pagerdutyIntegrationInfo?.name && (
          <PagerdutyIntegrationLinkChip
            to={`/trigger-incident/${chartRelease.environment}`}
            pagerdutyIntegrationName={
              chartRelease.environmentInfo?.pagerdutyIntegrationInfo?.name
            }
            arrow
          />
        )
      )}
      {chartRelease.name && <ArgoLinkChip chartRelease={chartRelease.name} />}
    </div>
    <ChartReleaseDetails
      chartRelease={chartRelease}
      showChips={false}
      toChangeVersions={`/environments/${chartRelease.environment}/chart-releases/${chartRelease.chart}/change-versions`}
      toVersionHistory={`/environments/${chartRelease.environment}/chart-releases/${chartRelease.chart}/applied-changesets`}
    />
  </>
);
