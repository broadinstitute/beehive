import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ListChartReleaseButtonText } from "../list/list-chart-release-button-text";
import { matchChartRelease } from "../list/match-chart-release";

export const SidebarSelectOtherChartRelease: React.FunctionComponent<{
  chartReleases: SerializeFrom<SherlockChartReleaseV3[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
  showVersion?: "app" | "chart" | "none";
}> = ({ chartReleases, fieldValue, setFieldValue, showVersion }) => (
  <SidebarFilterControlledList
    title="Select Other Instance"
    entries={chartReleases}
    filterText={fieldValue}
    filter={matchChartRelease}
    handleListButtonClick={(entry) => setFieldValue(entry.name || "")}
    detectListButtonActive={(entry) => entry.name === fieldValue}
    listButtonTextFactory={(entry) => (
      <ListChartReleaseButtonText
        chartRelease={entry}
        showDestination="auto"
        showVersion={showVersion}
      />
    )}
    {...ChartReleaseColors}
  />
);
