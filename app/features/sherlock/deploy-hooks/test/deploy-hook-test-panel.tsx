import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockGithubActionsDeployHookTestRunRequest,
  SherlockSlackDeployHookTestRunRequest,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import type { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { DeployHookColors } from "../deploy-hook-colors";

export const DeployHookTestPanel: React.FunctionComponent<{
  errorInfo?: SerializeFrom<
    ReturnedErrorInfo<
      | SherlockSlackDeployHookTestRunRequest
      | SherlockGithubActionsDeployHookTestRunRequest
    >
  >;
  type: "Slack" | "GitHub Actions";
}> = ({ errorInfo, type }) => {
  // typically resolves to undefined, which is falsy
  const existingFormState = new Boolean(
    errorInfo?.formState?.execute,
  ).toString();
  const [execute, setExecute] = useState<"true" | "false">(
    existingFormState === "true" ? "true" : "false",
  );
  return (
    <OutsetPanel alwaysShowScrollbar>
      <ActionBox title="Test" submitText="Run Test" {...DeployHookColors}>
        <h2 className="font-light text-2xl text-color-header-text">
          Initiate a Test Run of This {type} Deploy Hook?
        </h2>
        <p>
          Choose whether the hook should be fully executed or whether Beehive
          should stop just sort of calling {type}.
        </p>
        <EnumInputSelect<"true" | "false">
          name="execute"
          className="grid grid-cols-2 mt-2"
          fieldValue={execute}
          setFieldValue={setExecute}
          enums={[
            ["Fully Execute", "true"],
            ["Dry-Run", "false"],
          ]}
          {...DeployHookColors}
        />
        {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
      </ActionBox>
    </OutsetPanel>
  );
};
