import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockGithubActionsDeployHookV3,
  SherlockSlackDeployHookV3,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import type { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { useSidebar } from "~/hooks/use-sidebar";
import { DeployHookColors } from "../deploy-hook-colors";
import { ControlledDeployHookConditionEditableFields } from "../edit/deploy-hook-condition-editable-fields";
import { GithubActionsDeployHookEditableFields } from "../edit/github-actions-deploy-hook-editable-fields";
import { GithubActionsDeployHookSidebarFallback } from "../edit/github-actions-deploy-hook-sidebar-fallback";
import { SlackDeployHookEditableFields } from "../edit/slack-deploy-hook-editable-fields";

export const DeployHooksNewPanel: React.FunctionComponent<{
  errorInfo?: SerializeFrom<
    ReturnedErrorInfo<
      SherlockSlackDeployHookV3 | SherlockGithubActionsDeployHookV3
    >
  >;
  githubInfo: {
    [key: string]: {
      [key: string]: string[];
    };
  };
}> = ({ errorInfo, githubInfo }) => {
  const {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    wasSidebarPresent,
    SidebarComponent,
  } = useSidebar();

  const [type, setType] = useState<"slack" | "github-actions">("slack");

  const [githubActionsFileUrl, setGithubActionsFileUrl] = useState<string>();
  const [githubActionsFileName, setGithubActionsFileName] = useState<string>();

  const [onSuccess, setOnSuccess] = useState<"true" | "false">(
    errorInfo?.formState?.onSuccess === false ? "false" : "true",
  );
  const [onFailure, setOnFailure] = useState<"true" | "false">(
    errorInfo?.formState?.onFailure === false ? "false" : "true",
  );

  return (
    <>
      <OutsetPanel {...DeployHookColors} alwaysShowScrollbar>
        <ActionBox
          title="Adding New Deploy Hook"
          submitText="Add Deploy Hook"
          {...DeployHookColors}
        >
          <div>
            <h2 className="font-light text-2xl">Type</h2>
            <EnumInputSelect<"slack" | "github-actions">
              name="type"
              className="grid grid-cols-2 mt-2"
              fieldValue={type}
              setFieldValue={(value) => {
                setType(value);
                if (value === "github-actions") {
                  setOnSuccess("true");
                  setOnFailure("false");
                }
                if (value === "slack") {
                  setOnSuccess("true");
                  setOnFailure("true");
                  setSidebar();
                }
              }}
              enums={[
                ["Slack", "slack"],
                ["GitHub Actions", "github-actions"],
              ]}
              {...DeployHookColors}
            />
          </div>
          <div className="pl-6 border-l-2 border-color-divider-line flex gap-4 flex-col">
            {type === "slack" && (
              <>
                <p>
                  Beehive will send a Slack message with information about the
                  deployment to a channel of your choosing.
                </p>
                <SlackDeployHookEditableFields
                  existing={errorInfo?.formState}
                />
              </>
            )}
            {type === "github-actions" && (
              <>
                <p>
                  Beehive will run a GitHub Action workflow (via{" "}
                  <a
                    href="https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-color-link-underline"
                  >
                    "workflow dispatch"
                  </a>
                  ) with configuration provided here.
                </p>
                <GithubActionsDeployHookEditableFields
                  existing={errorInfo?.formState}
                  githubInfo={githubInfo}
                  provideFileUrl={setGithubActionsFileUrl}
                  provideFileName={setGithubActionsFileName}
                  setSidebar={setSidebar}
                  setSidebarFilterText={setSidebarFilterText}
                />
              </>
            )}
          </div>
          <ControlledDeployHookConditionEditableFields
            onSuccess={onSuccess}
            setOnSuccess={setOnSuccess}
            onFailure={onFailure}
            setOnFailure={setOnFailure}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      {wasSidebarPresent && (
        <InsetPanel alwaysShowScrollbar>
          {isSidebarPresent && <SidebarComponent />}
          {!isSidebarPresent && type === "github-actions" && (
            <GithubActionsDeployHookSidebarFallback
              filename={githubActionsFileName}
              url={githubActionsFileUrl}
            />
          )}
        </InsetPanel>
      )}
    </>
  );
};
