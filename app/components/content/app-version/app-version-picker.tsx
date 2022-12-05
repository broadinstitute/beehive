import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { AppVersionColors } from "./app-version-colors";

export interface AppVersionPickerProps {
  isTargetingChangeset?: boolean;
  defaultAppVersionResolver: string;
  appVersionExact: string;
  setAppVersionExact: (value: string) => void;
  setShowAppVersionExactPicker: (value: boolean) => void;
  appVersionFollowChartRelease: string;
  setAppVersionFollowChartRelease: (value: string) => void;
  setShowAppVersionFollowChartReleasePicker: (value: boolean) => void;
  defaultAppVersionCommit?: string;
  appVersionBranch: string;
  setAppVersionBranch: (value: string) => void;
  setShowAppVersionBranchPicker: (value: boolean) => void;
  showFirecloudDevelopRefField?: boolean;
  defaultFirecloudDevelopRef: string;
  hideOtherPickers?: () => void;
}

export const AppVersionPicker: React.FunctionComponent<
  AppVersionPickerProps
> = ({
  isTargetingChangeset,
  defaultAppVersionResolver,
  appVersionExact,
  setAppVersionExact,
  defaultAppVersionCommit,
  setShowAppVersionExactPicker,
  appVersionFollowChartRelease,
  setAppVersionFollowChartRelease,
  setShowAppVersionFollowChartReleasePicker,
  appVersionBranch,
  setAppVersionBranch,
  setShowAppVersionBranchPicker,
  showFirecloudDevelopRefField,
  defaultFirecloudDevelopRef,
  hideOtherPickers = () => {},
}) => {
  const [appVersionResolver, setAppVersionResolver] = useState(
    defaultAppVersionResolver
  );
  const [appVersionCommit, setAppVersionCommit] = useState(
    defaultAppVersionCommit || ""
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
          className="grid grid-cols-5 mt-2"
          fieldValue={appVersionResolver}
          setFieldValue={(value) => {
            setShowAppVersionExactPicker(value === "exact");
            setShowAppVersionFollowChartReleasePicker(value === "follow");
            setShowAppVersionBranchPicker(value === "branch");
            hideOtherPickers();
            setAppVersionResolver(value);
          }}
          enums={[
            ["Exact", "exact"],
            ["Other Instance", "follow"],
            ["Git Commit", "commit"],
            ["Git Branch", "branch"],
            ["None", "none"],
          ]}
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
                onChange={(e) => setAppVersionExact(e.currentTarget.value)}
                onFocus={() => {
                  setShowAppVersionExactPicker(true);
                  setShowAppVersionBranchPicker(false);
                  setShowAppVersionFollowChartReleasePicker(false);
                  hideOtherPickers();
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
                onChange={(e) =>
                  setAppVersionFollowChartRelease(e.currentTarget.value)
                }
                onFocus={() => {
                  setShowAppVersionFollowChartReleasePicker(true);
                  setShowAppVersionBranchPicker(false);
                  setShowAppVersionBranchPicker(false);
                  hideOtherPickers();
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
                  setShowAppVersionExactPicker(false);
                  setShowAppVersionBranchPicker(false);
                  setShowAppVersionFollowChartReleasePicker(false);
                  hideOtherPickers();
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
                onChange={(e) => setAppVersionBranch(e.currentTarget.value)}
                onFocus={() => {
                  setShowAppVersionBranchPicker(true);
                  setShowAppVersionExactPicker(false);
                  setShowAppVersionFollowChartReleasePicker(false);
                  hideOtherPickers();
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
          {showFirecloudDevelopRefField && (
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
                defaultValue={defaultFirecloudDevelopRef}
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
