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
  defaultAppVersionCommit?: string;
  appVersionBranch: string;
  setAppVersionBranch: (value: string) => void;
  setShowAppVersionBranchPicker: (value: boolean) => void;
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
  appVersionBranch,
  setAppVersionBranch,
  setShowAppVersionBranchPicker,
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
          className="grid grid-cols-4 mt-2"
          fieldValue={appVersionResolver}
          setFieldValue={(value) => {
            setShowAppVersionExactPicker(value === "exact");
            setShowAppVersionBranchPicker(value === "branch");
            hideOtherPickers();
            setAppVersionResolver(value);
          }}
          enums={[
            ["Exact", "exact"],
            ["Commit", "commit"],
            ["Branch", "branch"],
            ["None", "none"],
          ]}
          {...AppVersionColors}
        />
        <div className="pl-6 border-l-2 border-zinc-400 mt-4">
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
                  hideOtherPickers();
                }}
                required
                placeholder="Enter custom value or search..."
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
        </div>
      </div>
    </div>
  );
};
