import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { ArgoLinkChip } from "~/features/sherlock/chart-releases/chart-release-link-chip";
import { AppInstanceInfoIcon } from "./app-instance-info-icon";

export const AppInstanceEntryInfo: React.FunctionComponent<{
  chartRelease: SerializeFrom<V2controllersChartRelease>;
}> = ({ chartRelease }) => (
  <div className="flex flex-row gap-4">
    <div>
      <AppInstanceInfoIcon chartRelease={chartRelease} />
    </div>
    <div className="flex flex-col gap-2">
      <h2 className="text-color-header-text text-4xl font-medium">
        {chartRelease.environment}
      </h2>
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
