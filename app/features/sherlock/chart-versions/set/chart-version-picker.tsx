import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockChartReleaseV3,
  SherlockChartVersionV3,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { ChartVersionColors } from "~/features/sherlock/chart-versions/chart-version-colors";
import type { SetsSidebarProps } from "~/hooks/use-sidebar";
import { SidebarSelectOtherChartRelease } from "../../chart-releases/set/sidebar-select-other-chart-release";
import { SidebarSelectChartVersion } from "./sidebar-select-chart-version";

export const ChartVersionPicker: React.FunctionComponent<
  {
    chartVersions: SerializeFrom<SherlockChartVersionV3[]>;
    chartReleases: SerializeFrom<SherlockChartReleaseV3[]>;
    isTargetingChangeset: boolean;

    initialChartVersionResolver: string;
    initialChartVersionExact: string;
    initialChartVersionFollowChartRelease: string;
    initialHelmfileRef: string;
    initialHelmfileRefEnabled: string;
  } & SetsSidebarProps
> = ({
  setSidebarFilterText,
  setSidebar,
  chartVersions,
  chartReleases,
  isTargetingChangeset,
  initialChartVersionResolver,
  initialChartVersionExact,
  initialChartVersionFollowChartRelease,
  initialHelmfileRef,
  initialHelmfileRefEnabled,
}) => {
  const [chartVersionResolver, setChartVersionResolver] = useState(
    initialChartVersionResolver,
  );
  const [chartVersionExact, setChartVersionExact] = useState(
    initialChartVersionExact,
  );
  const [chartVersionFollowChartRelease, setChartVersionFollowChartRelease] =
    useState(initialChartVersionFollowChartRelease);
  const [helmfileRefEnabled, setHelmfileRefEnabled] = useState(
    initialHelmfileRefEnabled,
  );
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Specify Chart Version
        </h2>
        <p>You can change versions later.</p>
        <EnumInputSelect
          name={
            isTargetingChangeset
              ? "toChartVersionResolver"
              : "chartVersionResolver"
          }
          className="grid grid-cols-3 mt-2"
          fieldValue={chartVersionResolver}
          setFieldValue={(value) => {
            if (value === "exact") {
              setSidebar(({ filterText }) => (
                <SidebarSelectChartVersion
                  chartVersions={chartVersions}
                  fieldValue={filterText}
                  setFieldValue={(value) => {
                    setChartVersionExact(value);
                    setSidebar();
                  }}
                />
              ));
            } else if (value === "follow") {
              setSidebar(({ filterText }) => (
                <SidebarSelectOtherChartRelease
                  chartReleases={chartReleases}
                  fieldValue={filterText}
                  setFieldValue={(value) => {
                    setChartVersionFollowChartRelease(value);
                    setSidebar();
                  }}
                  showVersion="chart"
                />
              ));
            } else {
              setSidebar();
            }
            setChartVersionResolver(value);
          }}
          enums={[
            ["Exact", "exact"],
            ["Other Instance", "follow"],
            ["Latest", "latest"],
          ]}
          {...ChartVersionColors}
        />
      </div>
      <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col space-y-4">
        {chartVersionResolver === "exact" && (
          <label>
            <h2 className="font-light text-2xl text-color-header-text">
              Set Exact Version
            </h2>
            <p className="mb-2">
              An exact value will always persist until explicitly changed. It
              won't be affected by refreshes.
            </p>
            <p>
              This must be the semver version of a published chart. You should
              be able to find it in the list on the right.
            </p>
            <TextField
              name={
                isTargetingChangeset
                  ? "toChartVersionExact"
                  : "chartVersionExact"
              }
              pattern="\d+\.\d+.\d+.*"
              value={chartVersionExact}
              onChange={(e) => {
                setChartVersionExact(e.currentTarget.value);
                setSidebarFilterText(e.currentTarget.value);
              }}
              onFocus={() =>
                setSidebar(({ filterText }) => (
                  <SidebarSelectChartVersion
                    chartVersions={chartVersions}
                    fieldValue={filterText}
                    setFieldValue={(value) => {
                      setChartVersionExact(value);
                      setSidebar();
                    }}
                  />
                ))
              }
              required
              placeholder="Enter custom value or search..."
            />
          </label>
        )}
        {chartVersionResolver === "follow" && (
          <label>
            <h2 className="font-light text-2xl text-color-header-text">
              Select Other Instance
            </h2>
            <p>
              Another instance of this chart to get the chart version from. As
              long as this is set, future refreshes will grab whatever version
              that other instance has.
            </p>
            <TextField
              name={
                isTargetingChangeset
                  ? "toChartVersionFollowChartRelease"
                  : "chartVersionFollowChartRelease"
              }
              value={chartVersionFollowChartRelease}
              onChange={(e) => {
                setChartVersionFollowChartRelease(e.currentTarget.value);
                setSidebarFilterText(e.currentTarget.value);
              }}
              onFocus={() =>
                setSidebar(({ filterText }) => (
                  <SidebarSelectOtherChartRelease
                    chartReleases={chartReleases}
                    fieldValue={filterText}
                    setFieldValue={(value) => {
                      setChartVersionFollowChartRelease(value);
                      setSidebar();
                    }}
                    showVersion="chart"
                  />
                ))
              }
              required
              placeholder="Search..."
            />
          </label>
        )}
        {chartVersionResolver === "latest" && (
          <p>
            Our systems will look for the latest version of the chart
            automatically upon each refresh.
          </p>
        )}
        <div>
          <h2 className="font-light text-xl">Custom Helmfile Ref</h2>
          <EnumInputSelect
            name={
              isTargetingChangeset
                ? "toHelmfileRefEnabled"
                : "helmfileRefEnabled"
            }
            className="grid grid-cols-2 mt-2"
            fieldValue={helmfileRefEnabled}
            setFieldValue={setHelmfileRefEnabled}
            enums={[
              ["Enabled", "true"],
              ["Disabled", "false"],
            ]}
            {...ChartVersionColors}
          />
        </div>
        {helmfileRefEnabled === "true" && (
          <label>
            <h2 className="font-light text-xl">Helmfile Ref</h2>
            <p>
              This is the Git reference in{" "}
              <a
                href="https://github.com/broadinstitute/terra-helmfile"
                target="_blank"
                className="underline decoration-color-link-underline"
                rel="noreferrer"
              >
                terra-helmfile
              </a>{" "}
              to use for Helm. Set this to the name of your PR branch to test
              before merging.
            </p>
            <TextField
              name={isTargetingChangeset ? "toHelmfileRef" : "helmfileRef"}
              defaultValue={initialHelmfileRef}
              required
              placeholder="(required)"
            />
          </label>
        )}
      </div>
    </div>
  );
};
