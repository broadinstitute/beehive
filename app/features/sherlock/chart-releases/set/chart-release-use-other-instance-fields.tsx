import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";
import React from "react";
import { TextField } from "~/components/interactivity/text-field";
import type { SetsSidebarProps } from "~/hooks/use-sidebar";
import { SidebarSelectOtherChartRelease } from "./sidebar-select-other-chart-release";

export const ChartReleaseUseOtherInstanceFields: React.FunctionComponent<
  {
    chartReleases: SerializeFrom<SherlockChartReleaseV3[]>;
    chartName: string;
    preconfigured?: boolean;
    useExactVersionsFromOtherChartRelease: string;
    setUseExactVersionsFromOtherChartRelease: (value: string) => void;
  } & SetsSidebarProps
> = ({
  setSidebarFilterText,
  setSidebar,

  chartReleases,
  chartName,
  preconfigured,
  useExactVersionsFromOtherChartRelease,
  setUseExactVersionsFromOtherChartRelease,
}) => (
  <label>
    <h2 className="font-light text-2xl text-color-header-text">
      Use Exact Versions From Another Instance of This Chart
    </h2>
    <p>
      This is a shortcut to copy the current exact versions from another
      instance of {chartName}. It won't start following the other instance's
      versions or copy other configuration—it is a one-time copy of the current
      versions.
    </p>
    {preconfigured && (
      <p className="mt-2 font-medium">
        Note that this field was preconfigured from the link you followed.
      </p>
    )}
    <TextField
      name="useExactVersionsFromOtherChartRelease"
      value={useExactVersionsFromOtherChartRelease}
      onChange={(e) => {
        setUseExactVersionsFromOtherChartRelease(e.currentTarget.value);
        setSidebarFilterText(e.currentTarget.value);
      }}
      onFocus={() => {
        setSidebar(({ filterText }) => (
          <SidebarSelectOtherChartRelease
            chartReleases={chartReleases}
            fieldValue={filterText}
            setFieldValue={(value) => {
              setUseExactVersionsFromOtherChartRelease(value);
            }}
          />
        ));
      }}
      placeholder="Search..."
    />
  </label>
);
