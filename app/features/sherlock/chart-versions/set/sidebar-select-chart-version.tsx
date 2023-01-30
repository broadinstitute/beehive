import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartVersion } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { ChartVersionColors } from "~/features/sherlock/chart-versions/chart-version-colors";
import { ListChartVersionButtonText } from "../list/list-chart-version-button-text";
import { matchChartVersion } from "../list/match-chart-version";

export const SidebarSelectChartVersion: React.FunctionComponent<{
  chartVersions: SerializeFrom<V2controllersChartVersion[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
}> = ({ chartVersions, fieldValue, setFieldValue }) => (
  <SidebarFilterControlledList
    title="Select Chart Version"
    entries={chartVersions}
    filterText={fieldValue}
    filter={matchChartVersion}
    handleListButtonClick={(entry) => setFieldValue(entry.chartVersion || "")}
    detectListButtonActive={(entry) => entry.chartVersion === fieldValue}
    listButtonTextFactory={(entry) => (
      <ListChartVersionButtonText chartVersion={entry} />
    )}
    {...ChartVersionColors}
  />
);
