import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import React from "react";
import { TextField } from "~/components/interactivity/text-field";
import { SidebarSelectOtherChartRelease } from "./sidebar-select-other-chart-release";

export const ChartReleaseUseOtherInstanceFields: React.FunctionComponent<{
  chartReleases: SerializeFrom<V2controllersChartRelease[]>;
  setSidebar: (sidebar?: React.ReactNode) => void;
  chartName: string;
  preconfigured?: boolean;
  useExactVersionsFromOtherChartRelease: string;
  setUseExactVersionsFromOtherChartRelease: (value: string) => void;
}> = ({
  chartReleases,
  setSidebar,
  chartName,
  preconfigured,
  useExactVersionsFromOtherChartRelease,
  setUseExactVersionsFromOtherChartRelease,
}) => (
  <label>
    <h2 className="font-light text-2xl">
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
      onChange={(e) =>
        setUseExactVersionsFromOtherChartRelease(e.currentTarget.value)
      }
      onFocus={() => {
        setSidebar(
          <SidebarSelectOtherChartRelease
            chartReleases={chartReleases}
            fieldValue={useExactVersionsFromOtherChartRelease}
            setFieldValue={(value) => {
              setUseExactVersionsFromOtherChartRelease(value);
              setSidebar();
            }}
          />
        );
      }}
      placeholder="Search..."
    />
  </label>
);
