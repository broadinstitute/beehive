import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { SidebarFilterList } from "~/components/panel-structures/sidebar-filter-list";
import { ChartReleaseColors } from "../chart-release-colors";
import { matchChartRelease } from "../list/match-chart-release";

export const SidebarSelectMultipleChartReleases: React.FunctionComponent<{
  title?: string;
  chartReleases: SerializeFrom<V2controllersChartRelease[]>;
  chartMap: Map<string, boolean>;
  setChartMap: (value: React.SetStateAction<Map<string, boolean>>) => void;
  includeAppVersions?: boolean;
}> = ({
  title = "Select Charts",
  chartReleases,
  chartMap,
  setChartMap,
  includeAppVersions,
}) => {
  const [filterText, setFilterText] = useState("");
  return (
    <SidebarFilterList
      title={title}
      entries={chartReleases}
      filterText={filterText}
      setFilterText={setFilterText}
      filter={matchChartRelease}
      handleListButtonClick={(entry) =>
        setChartMap(
          (previous) =>
            new Map([
              ...previous,
              [entry.chart || "", !previous.get(entry.chart || "")],
            ]),
        )
      }
      detectListButtonActive={(entry) =>
        chartMap.get(entry.chart || "") || false
      }
      listButtonTextFactory={(entry) => (
        <h2 className="font-light">
          <input
            className="w-4 h-4 mr-2"
            type="checkbox"
            checked={chartMap.get(entry.chart || "") || false}
            readOnly
          />
          <span className="font-medium">{entry.chart}</span>
          {includeAppVersions &&
            entry.appVersionResolver !== "none" &&
            ` (app @ ${entry.appVersionExact})`}
        </h2>
      )}
      {...ChartReleaseColors}
    />
  );
};
