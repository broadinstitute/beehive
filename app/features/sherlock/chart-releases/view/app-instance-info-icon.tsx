import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { Info } from "lucide-react";
import { useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { Popover } from "~/components/interactivity/popover";
import {
  ArgoLinkChip,
  ChartReleaseLinkChip,
} from "~/features/sherlock/chart-releases/chart-release-link-chip";
import { ClusterLinkChip } from "~/features/sherlock/clusters/cluster-link-chip";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { EnvironmentLinkChip } from "~/features/sherlock/environments/environment-link-chip";
import { PagerdutyIntegrationLinkChip } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-link-chip";

export const AppInstanceInfoIcon: React.FunctionComponent<{
  chartRelease: SerializeFrom<V2controllersChartRelease>;
}> = ({ chartRelease }) => {
  const [open, onOpenChange] = useState(false);
  return (
    <Popover
      open={open}
      size="one-third"
      onOpenChange={onOpenChange}
      openButton={(ref, props) => (
        <ActionButton
          sizeClassName="w-min py-1"
          type="button"
          ref={ref}
          isHovered={open}
          {...EnvironmentColors}
          {...props()}
        >
          <Info className="w-9 h-9 stroke-color-header-text" />
        </ActionButton>
      )}
      {...EnvironmentColors}
    >
      <h2 className="font-light text-4xl text-color-header-text">
        Instance of <b className="font-semibold">{chartRelease.chart}</b> in{" "}
        <b className="font-semibold">{chartRelease.environment}</b>
      </h2>
      <div className="flex flex-row gap-3 flex-wrap pb-2">
        {chartRelease.name &&
          chartRelease.chart &&
          chartRelease.environment && (
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
            pagerdutyIntegrationName={
              chartRelease.pagerdutyIntegrationInfo?.name
            }
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
      {/* {chartRelease.environment === "prod" && (
        <ProdWarning name={chartRelease.name || ""} />
      )} */}
    </Popover>
  );
};
