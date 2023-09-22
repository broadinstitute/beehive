import type { SerializeFrom } from "@remix-run/node";
import type { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { SidebarFilterList } from "~/components/panel-structures/sidebar-filter-list";
import { ChartColors } from "../../charts/chart-colors";
import { ChartReleaseColors } from "../chart-release-colors";
import { matchChartRelease } from "../list/match-chart-release";

export const SidebarSelectMultipleChartReleases: React.FunctionComponent<{
  title?: string;
  chartReleases: SerializeFrom<V2controllersChartRelease[]>;
  chartMap: Map<string, boolean>;
  setChartMap: (value: React.SetStateAction<Map<string, boolean>>) => void;
  includeAppVersions?: boolean;
  defaultChartMap?: Map<string, boolean>;
}> = ({
  title = "Select Charts",
  chartReleases,
  chartMap,
  setChartMap,
  includeAppVersions,
  defaultChartMap,
}) => {
  const [filterText, setFilterText] = useState("");
  return (
    <SidebarFilterList
      title={title}
      entries={chartReleases}
      filterText={filterText}
      setFilterText={setFilterText}
      filter={matchChartRelease}
      leadingButtons={
        <div
          className={`grid grid-cols-1 ${
            defaultChartMap ? "laptop:grid-cols-3" : "laptop:grid-cols-2"
          } gap-4 w-full`}
        >
          <ActionButton
            size="fill"
            onClick={() => {
              setChartMap(
                (previous) =>
                  new Map(
                    Array.from(previous.keys()).map((chartName) => [
                      chartName,
                      false,
                    ]),
                  ),
              );
            }}
            type="button"
            {...ChartColors}
          >
            None
          </ActionButton>
          {defaultChartMap && (
            <ActionButton
              size="fill"
              onClick={() => {
                setChartMap(new Map(defaultChartMap));
              }}
              type="button"
              {...ChartColors}
            >
              Default
            </ActionButton>
          )}
          <ActionButton
            size="fill"
            onClick={() => {
              setChartMap(
                (previous) =>
                  new Map(
                    Array.from(previous.keys()).map((chartName) => [
                      chartName,
                      true,
                    ]),
                  ),
              );
            }}
            type="button"
            {...ChartColors}
          >
            All
          </ActionButton>
        </div>
      }
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
