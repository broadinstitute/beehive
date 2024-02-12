import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";
import { InlinePopover } from "~/components/interactivity/inline-popover";
import { ArgoLinkChip } from "~/features/sherlock/chart-releases/chart-release-link-chip";
import { CiRunResourceStatusWidget } from "../../ci/view/ci-run-resource-status-button";
import { EnvironmentColors } from "../../environments/environment-colors";
import { AppInstancePopoverContents } from "./app-instance-popover-contents";

export const AppInstanceEntryInfo: React.FunctionComponent<{
  chartRelease: SerializeFrom<SherlockChartReleaseV3>;
}> = ({ chartRelease }) => (
  <div className="flex flex-col tablet:flex-row gap-4">
    <div className="flex tablet:w-80 shrink-0 flex-col gap-2 items-start">
      {chartRelease.environment && (
        <InlinePopover
          inlineText={chartRelease.environment}
          className="text-color-header-text text-4xl font-medium"
          {...EnvironmentColors}
        >
          <AppInstancePopoverContents chartRelease={chartRelease} />
        </InlinePopover>
      )}
      {chartRelease.name && <ArgoLinkChip chartRelease={chartRelease.name} />}
      <CiRunResourceStatusWidget
        ciIdentifier={
          chartRelease.ciIdentifier?.id || `chart-release/${chartRelease.id}`
        }
        asChip
      />
    </div>
    <div className="border-r border-color-divider-line"></div>
    <div className="flex flex-col gap-2 grow">
      <h2 className="text-color-header-text text-4xl font-light">
        app @ {chartRelease.appVersionExact}
      </h2>
      <div className="h-8 flex flex-row gap-4 items-center">
        <span className="text-xl font-light">
          chart @ {chartRelease.chartVersionExact}
        </span>
      </div>
    </div>
  </div>
);
