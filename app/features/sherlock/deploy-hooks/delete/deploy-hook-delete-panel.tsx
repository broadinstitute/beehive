import type { SerializeFrom } from "@remix-run/node";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import type { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { DeployHookColors } from "../deploy-hook-colors";

export const DeployHookDeletePanel: React.FunctionComponent<{
  errorInfo?: SerializeFrom<ReturnedErrorInfo<unknown>>;
  type: "Slack" | "GitHub Actions";
}> = ({ errorInfo, type }) => (
  <OutsetPanel alwaysShowScrollbar>
    <ActionBox title="Delete" submitText="Delete" {...DeployHookColors}>
      <p>Delete this {type} deploy hook?</p>
      <p>You can create a similar one again in the future.</p>
      {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
    </ActionBox>
  </OutsetPanel>
);
