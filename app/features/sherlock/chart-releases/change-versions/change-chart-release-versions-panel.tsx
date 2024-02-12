import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockAppVersionV3,
  SherlockChangesetV3PlanRequestChartReleaseEntry,
  SherlockChartReleaseV3,
  SherlockChartVersionV3,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import type { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { isReturnedFormErrorInfo } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseChangeVersionHelpCopy } from "~/features/sherlock/chart-releases/change-versions/chart-release-change-version-help-copy";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { useSidebar } from "~/hooks/use-sidebar";
import { AppVersionPicker } from "../../app-versions/set/app-version-picker";
import { ChartVersionPicker } from "../../chart-versions/set/chart-version-picker";
import { ChartReleaseUseOtherInstanceFields } from "../set/chart-release-use-other-instance-fields";

export const ChangeChartReleaseVersionsPanel: React.FunctionComponent<{
  chartRelease: SerializeFrom<SherlockChartReleaseV3>;

  otherChartReleases: SerializeFrom<SherlockChartReleaseV3[]>;
  appVersions: SerializeFrom<SherlockAppVersionV3[]>;
  chartVersions: SerializeFrom<SherlockChartVersionV3[]>;
  preconfiguredAppVersionExact?: string | null;
  preconfiguredChartVersionExact?: string | null;
  preconfiguredOtherEnvironment?: string | null;

  actionData?:
    | SerializeFrom<{
        formState: SherlockChangesetV3PlanRequestChartReleaseEntry;
      }>
    | SerializeFrom<
        ReturnedErrorInfo<SherlockChangesetV3PlanRequestChartReleaseEntry>
      >;
}> = ({
  chartRelease,
  otherChartReleases,
  appVersions,
  chartVersions,
  preconfiguredAppVersionExact,
  preconfiguredChartVersionExact,
  preconfiguredOtherEnvironment,
  actionData,
}) => {
  const errorSummary =
    actionData && isReturnedFormErrorInfo(actionData)
      ? actionData.errorSummary
      : undefined;
  const formState = actionData?.formState;
  const preconfiguredVersions = Boolean(
    preconfiguredAppVersionExact || preconfiguredChartVersionExact,
  );

  const {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    SidebarComponent,
  } = useSidebar();

  const [
    useExactVersionsFromOtherChartRelease,
    setUseExactVersionsFromOtherChartRelease,
  ] = useState(
    formState?.useExactVersionsFromOtherChartRelease ||
      (preconfiguredOtherEnvironment
        ? `${preconfiguredOtherEnvironment}/${chartRelease.chart}`
        : ""),
  );

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title="Now Changing Versions"
          submitText="Click to Refresh and Preview Changes"
          {...ChartReleaseColors}
        >
          {preconfiguredVersions || (
            <ChartReleaseUseOtherInstanceFields
              setSidebar={setSidebar}
              setSidebarFilterText={setSidebarFilterText}
              chartReleases={otherChartReleases}
              chartName={chartRelease.name || ""}
              preconfigured={Boolean(preconfiguredOtherEnvironment)}
              useExactVersionsFromOtherChartRelease={
                useExactVersionsFromOtherChartRelease
              }
              setUseExactVersionsFromOtherChartRelease={
                setUseExactVersionsFromOtherChartRelease
              }
            />
          )}
          {(!useExactVersionsFromOtherChartRelease && (
            <>
              {(preconfiguredVersions && (
                <p className="font-medium">
                  Here are the current versions, plus the extra preconfiguration
                  from the link you followed.
                </p>
              )) || (
                <>
                  <div className="flex flex-row items-center gap-4 py-4">
                    <div className="grow border-b-2 border-color-divider-line"></div>
                    <div className="shrink-0 grow-0 font-medium text-xl text-color-header-text">
                      Or
                    </div>
                    <div className="grow border-b-2 border-color-divider-line"></div>
                  </div>
                  <p>
                    Here are the current versions. You can change them if you
                    like, or just go ahead and click the button at the bottom to
                    refresh and recalculate any "branch" or "latest" versions.
                  </p>
                </>
              )}
              <AppVersionPicker
                setSidebar={setSidebar}
                setSidebarFilterText={setSidebarFilterText}
                appVersions={appVersions}
                chartReleases={otherChartReleases}
                isTargetingChangeset={true}
                initialAppVersionResolver={
                  formState?.toAppVersionResolver ||
                  (preconfiguredAppVersionExact && "exact") ||
                  chartRelease.appVersionResolver ||
                  (chartRelease.chartInfo?.appImageGitRepo ? "branch" : "none")
                }
                initialAppVersionExact={
                  formState?.toAppVersionExact ||
                  preconfiguredAppVersionExact ||
                  chartRelease.appVersionExact ||
                  ""
                }
                initialAppVersionFollowChartRelease={
                  formState?.toAppVersionFollowChartRelease ||
                  chartRelease.appVersionFollowChartRelease ||
                  ""
                }
                initialAppVersionCommit={
                  formState?.toAppVersionCommit ||
                  chartRelease.appVersionCommit ||
                  ""
                }
                initialAppVersionBranch={
                  formState?.toAppVersionBranch ||
                  chartRelease.appVersionBranch ||
                  ""
                }
              />
              <ChartVersionPicker
                setSidebar={setSidebar}
                setSidebarFilterText={setSidebarFilterText}
                chartVersions={chartVersions}
                chartReleases={otherChartReleases}
                isTargetingChangeset={true}
                initialChartVersionResolver={
                  formState?.toChartVersionResolver ||
                  (preconfiguredChartVersionExact && "exact") ||
                  chartRelease.chartVersionResolver ||
                  "latest"
                }
                initialChartVersionExact={
                  formState?.toChartVersionExact ||
                  preconfiguredChartVersionExact ||
                  chartRelease.chartVersionExact ||
                  ""
                }
                initialChartVersionFollowChartRelease={
                  formState?.toChartVersionFollowChartRelease ||
                  chartRelease.chartVersionFollowChartRelease ||
                  ""
                }
                initialHelmfileRef={
                  formState?.toHelmfileRef || chartRelease.helmfileRef || "HEAD"
                }
                initialHelmfileRefEnabled={String(
                  formState?.toHelmfileRefEnabled ||
                    chartRelease.helmfileRefEnabled ||
                    false,
                )}
              />
            </>
          )) || (
            <p>
              Clear out the field above if you'd like to set versions yourself
              instead.
            </p>
          )}
          {!errorSummary && formState && (
            <p className="font-medium">
              There were no version changes with what you just specified.
            </p>
          )}
          {errorSummary && <FormErrorDisplay {...errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel largeScreenOnly={!isSidebarPresent}>
        {isSidebarPresent ? (
          <SidebarComponent />
        ) : (
          <FillerText>
            <ChartReleaseChangeVersionHelpCopy
              chartInstanceName={chartRelease.name}
            />
          </FillerText>
        )}
      </InsetPanel>
    </>
  );
};
