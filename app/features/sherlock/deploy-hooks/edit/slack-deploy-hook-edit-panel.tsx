import type { SerializeFrom } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import type { SherlockSlackDeployHookV3 } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import type { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { DeployHookColors } from "../deploy-hook-colors";
import { UncontrolledDeployHookConditionEditableFields } from "./deploy-hook-condition-editable-fields";
import { SlackDeployHookEditableFields } from "./slack-deploy-hook-editable-fields";

export const SlackDeployHookEditPanel: React.FunctionComponent<{
  slackHook: SerializeFrom<SherlockSlackDeployHookV3>;
  errorInfo?: SerializeFrom<ReturnedErrorInfo<SherlockSlackDeployHookV3>>;
}> = ({ slackHook, errorInfo }) => {
  const [searchParams] = useSearchParams();
  return (
    <OutsetPanel {...DeployHookColors} alwaysShowScrollbar>
      <ActionBox
        title="Slack Deploy Hook"
        submitText="Save"
        saved={searchParams.get("saved") === "true"}
        belowComponent={
          <>
            <NavButton to="./test-run" {...DeployHookColors}>
              Test
            </NavButton>
            <NavButton to="./delete" {...DeployHookColors}>
              Delete
            </NavButton>
          </>
        }
        {...DeployHookColors}
      >
        <SlackDeployHookEditableFields
          existing={errorInfo?.formState ?? slackHook}
        />
        <UncontrolledDeployHookConditionEditableFields
          existing={errorInfo?.formState ?? slackHook}
        />
        {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
      </ActionBox>
    </OutsetPanel>
  );
};
