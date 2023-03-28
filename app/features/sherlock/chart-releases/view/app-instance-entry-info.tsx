import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { InlinePopover } from "~/components/interactivity/inline-popover";
import { ArgoLinkChip } from "~/features/sherlock/chart-releases/chart-release-link-chip";
import { EnvironmentColors } from "../../environments/environment-colors";
import { AppInstancePopoverContents } from "./app-instance-popover-contents";

export const AppInstanceEntryInfo: React.FunctionComponent<{
  chartRelease: SerializeFrom<V2controllersChartRelease>;
}> = ({ chartRelease }) => (
  <div className="flex flex-row gap-4">
    <div className="flex flex-col gap-2 items-start">
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
