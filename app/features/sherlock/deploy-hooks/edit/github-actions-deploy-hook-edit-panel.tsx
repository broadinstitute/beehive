import type { SerializeFrom } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import type { SherlockGithubActionsDeployHookV3 } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import type { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { useSidebar } from "~/hooks/use-sidebar";
import { DeployHookColors } from "../deploy-hook-colors";
import { UncontrolledDeployHookConditionEditableFields } from "./deploy-hook-condition-editable-fields";
import { GithubActionsDeployHookEditableFields } from "./github-actions-deploy-hook-editable-fields";
import { GithubActionsDeployHookSidebarFallback } from "./github-actions-deploy-hook-sidebar-fallback";

export const GithubActionsDeployHookEditPanel: React.FunctionComponent<{
  githubActionsHook: SerializeFrom<SherlockGithubActionsDeployHookV3>;
  githubInfo: {
    [key: string]: {
      [key: string]: string[];
    };
  };
  errorInfo?: SerializeFrom<
    ReturnedErrorInfo<SherlockGithubActionsDeployHookV3>
  >;
  showRefBehaviorField?: boolean;
}> = ({ githubActionsHook, githubInfo, errorInfo, showRefBehaviorField }) => {
  const [searchParams] = useSearchParams();

  const {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    wasSidebarPresent,
    SidebarComponent,
  } = useSidebar();

  const [githubActionsFileUrl, setGithubActionsFileUrl] = useState<string>();
  const [githubActionsFileName, setGithubActionsFileName] = useState<string>();

  return (
    <>
      <OutsetPanel {...DeployHookColors} alwaysShowScrollbar>
        <ActionBox
          title="GitHub Actions Deploy Hook"
          submitText="Save"
          saved={searchParams.get("saved") === "true"}
          belowComponent={
            <NavButton
              to="./delete"
              onClick={() => setSidebar()}
              {...DeployHookColors}
            >
              Delete
            </NavButton>
          }
          {...DeployHookColors}
        >
          <GithubActionsDeployHookEditableFields
            existing={errorInfo?.formState ?? githubActionsHook}
            githubInfo={githubInfo}
            showRefBehaviorField={showRefBehaviorField}
            provideFileUrl={setGithubActionsFileUrl}
            provideFileName={setGithubActionsFileName}
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
          />
          <UncontrolledDeployHookConditionEditableFields
            existing={errorInfo?.formState ?? githubActionsHook}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      {wasSidebarPresent && (
        <InsetPanel alwaysShowScrollbar>
          {isSidebarPresent && <SidebarComponent />}
          {!isSidebarPresent && (
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
