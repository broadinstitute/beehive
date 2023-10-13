import { SerializeFrom } from "@remix-run/node";
import {
  SherlockAppVersionV3,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import React, { useMemo, useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { AppVersionColors } from "~/features/sherlock/app-versions/app-version-colors";
import { SetsSidebarProps } from "~/hooks/use-sidebar";
import { SidebarSelectOtherChartRelease } from "../../chart-releases/set/sidebar-select-other-chart-release";
import { SidebarSelectAppVersion } from "./sidebar-select-app-version";
import { SidebarSelectAppVersionBranch } from "./sidebar-select-app-version-branch";

export const AppVersionPicker: React.FunctionComponent<
  {
    appVersions: SerializeFrom<SherlockAppVersionV3[]>;
    chartReleases: SerializeFrom<V2controllersChartRelease[]>;
    isTargetingChangeset: boolean;
    showFirecloudDevelopRef?: boolean;

    initialAppVersionResolver: string;
    initialAppVersionExact: string;
    initialAppVersionCommit: string;
    initialAppVersionBranch: string;
    initialAppVersionFollowChartRelease: string;
    initialFirecloudDevelopRef: string;
  } & SetsSidebarProps
> = ({
  setSidebarFilterText,
  setSidebar,
  appVersions,
  chartReleases,
  isTargetingChangeset,
  showFirecloudDevelopRef,
  initialAppVersionResolver,
  initialAppVersionExact,
  initialAppVersionFollowChartRelease,
  initialAppVersionCommit,
  initialAppVersionBranch,
  initialFirecloudDevelopRef,
}) => {
  const [appVersionResolver, setAppVersionResolver] = useState(
    initialAppVersionResolver,
  );
  const [appVersionExact, setAppVersionExact] = useState(
    initialAppVersionExact,
  );
  const [appVersionFollowChartRelease, setAppVersionFollowChartRelease] =
    useState(initialAppVersionFollowChartRelease);
  const [appVersionCommit, setAppVersionCommit] = useState(
    initialAppVersionCommit,
  );
  const [appVersionBranch, setAppVersionBranch] = useState(
    initialAppVersionBranch,
  );

  const reportsGit = useMemo(
    () =>
      Boolean(
        appVersions.find(
          (appVersion) => appVersion.gitCommit && appVersion.gitBranch,
        ),
      ),
    [appVersions],
  );

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="font-light text-2xl">Specify App Version</h2>
        <p>
          Choose one option below, our systems will handle the others when you
          save. You can change versions later.
        </p>
        <EnumInputSelect
          name={
            isTargetingChangeset ? "toAppVersionResolver" : "appVersionResolver"
          }
          className={`mt-2 grid ${reportsGit ? "grid-cols-5" : "grid-cols-3"}`}
          fieldValue={appVersionResolver}
          setFieldValue={(value) => {
            if (value === "exact") {
              setSidebar(({ filterText }) => (
                <SidebarSelectAppVersion
                  appVersions={appVersions}
                  fieldValue={filterText}
                  setFieldValue={(value) => {
                    setAppVersionExact(value);
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
                    setAppVersionFollowChartRelease(value);
                    setSidebar();
                  }}
                />
              ));
            } else if (value === "branch") {
              setSidebar(({ filterText }) => (
                <SidebarSelectAppVersionBranch
                  appVersions={appVersions}
                  fieldValue={filterText}
                  setFieldValue={(value) => {
                    setAppVersionBranch(value);
                    setSidebar();
                  }}
                />
              ));
            } else {
              setSidebar();
            }
            setAppVersionResolver(value);
          }}
          enums={
            reportsGit
              ? [
                  ["Exact", "exact"],
                  ["Other Instance", "follow"],
                  ["Git Commit", "commit"],
                  ["Git Branch", "branch"],
                  ["None", "none"],
                ]
              : [
                  ["Exact", "exact"],
                  ["Other Instance", "follow"],
                  ["None", "none"],
                ]
          }
          {...AppVersionColors}
        />
        <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col space-y-4">
          {appVersionResolver === "exact" && (
            <label>
              <h2 className="font-light text-2xl">Set Exact Version</h2>
              <p>
                An exact value will always persist until explicitly changed. It
                won't be affected by refreshes.
              </p>
              <TextField
                name={
                  isTargetingChangeset ? "toAppVersionExact" : "appVersionExact"
                }
                value={appVersionExact}
                onChange={(e) => {
                  setAppVersionExact(e.currentTarget.value);
                  setSidebarFilterText(e.currentTarget.value);
                }}
                onFocus={() => {
                  setSidebar(({ filterText }) => (
                    <SidebarSelectAppVersion
                      appVersions={appVersions}
                      fieldValue={filterText}
                      setFieldValue={(value) => {
                        setAppVersionExact(value);
                        setSidebar();
                      }}
                    />
                  ));
                }}
                required
                placeholder="Enter custom value or search..."
              />
            </label>
          )}
          {appVersionResolver === "follow" && (
            <label>
              <h2 className="font-light text-2xl">Select Other Instance</h2>
              <p>
                Another instance of this chart to get the app version from. As
                long as this is set, future refreshes will grab whatever version
                that other instance has.
              </p>
              <TextField
                name={
                  isTargetingChangeset
                    ? "toAppVersionFollowChartRelease"
                    : "appVersionFollowChartRelease"
                }
                value={appVersionFollowChartRelease}
                onChange={(e) => {
                  setAppVersionFollowChartRelease(e.currentTarget.value);
                  setSidebarFilterText(e.currentTarget.value);
                }}
                onFocus={() => {
                  setSidebar(({ filterText }) => (
                    <SidebarSelectOtherChartRelease
                      chartReleases={chartReleases}
                      fieldValue={filterText}
                      setFieldValue={(value) => {
                        setAppVersionFollowChartRelease(value);
                        setSidebar();
                      }}
                    />
                  ));
                }}
                required
                placeholder="Search..."
              />
            </label>
          )}
          {appVersionResolver === "commit" && (
            <label>
              <h2 className="font-light text-2xl">Set Git Commit</h2>
              <p className="mb-2">
                Enter a commit hash from the app's repo and our systems will try
                to match the most recent build from that commit.
              </p>
              <p>
                You don't have to paste a full commit hash, it'll try to match
                with just the beginning. When you save you'll get an error if we
                can't find a match.
              </p>
              <TextField
                name={
                  isTargetingChangeset
                    ? "toAppVersionCommit"
                    : "appVersionCommit"
                }
                value={appVersionCommit}
                onChange={(e) => setAppVersionCommit(e.currentTarget.value)}
                onFocus={() => {
                  setSidebar();
                }}
                required
                placeholder="Enter custom value"
              />
            </label>
          )}
          {appVersionResolver === "branch" && (
            <label>
              <h2 className="font-light text-2xl">Set Git Branch</h2>
              <p className="mb-2">
                Set a branch name from the app's repo and our systems will try
                to match the most recent build from it. Refreshing the versions
                here later will look again for whatever is most recent.
              </p>
              <p>When you save you'll get an error if we can't find a match.</p>
              <TextField
                name={
                  isTargetingChangeset
                    ? "toAppVersionBranch"
                    : "appVersionBranch"
                }
                value={appVersionBranch}
                onChange={(e) => {
                  setAppVersionBranch(e.currentTarget.value);
                  setSidebarFilterText(e.currentTarget.value);
                }}
                onFocus={() => {
                  setSidebar(({ filterText }) => (
                    <SidebarSelectAppVersionBranch
                      appVersions={appVersions}
                      fieldValue={filterText}
                      setFieldValue={(value) => {
                        setAppVersionBranch(value);
                        setSidebar();
                      }}
                    />
                  ));
                }}
                required
                placeholder="Enter custom value or search..."
              />
            </label>
          )}
          {appVersionResolver === "none" && (
            <p>
              Our systems won't do anything special to set an app version for
              this chart instance. This option is most common for third party
              charts or charts we have that don't deploy an app.
            </p>
          )}
          {showFirecloudDevelopRef && (
            <label>
              <h2 className="font-light text-2xl">Firecloud Develop Ref</h2>
              <p>
                This is the Git reference in{" "}
                <a
                  href="https://github.com/broadinstitute/firecloud-develop"
                  target="_blank"
                  className="underline decoration-color-link-underline"
                >
                  firecloud-develop
                </a>{" "}
                to use for configuration values. This chart is marked as using
                legacy configuration, so this field is available and required.
              </p>
              <TextField
                name={
                  isTargetingChangeset
                    ? "toFirecloudDevelopRef"
                    : "firecloudDevelopRef"
                }
                defaultValue={initialFirecloudDevelopRef}
                required
                placeholder="(required)"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
