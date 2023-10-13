import type { ActionFunctionArgs, TypedResponse } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type {
  SherlockGithubActionsDeployHookV3Create,
  SherlockSlackDeployHookV3Create,
} from "@sherlock-js-client/sherlock";
import { DeployHooksApi } from "@sherlock-js-client/sherlock";
import type { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { SherlockConfiguration, handleIAP } from "../../sherlock.server";

export async function newDeployHookAction(
  request: ActionFunctionArgs["request"],
  currentPagePath: string,
  partialTriggerConfig:
    | {
        onEnvironment: string;
      }
    | { onChartRelease: string },
) {
  await getValidSession(request);

  const formData = await request.formData();

  let ret: Promise<
    TypedResponse<
      | never
      | ReturnedErrorInfo<
          | SherlockSlackDeployHookV3Create
          | SherlockGithubActionsDeployHookV3Create
        >
    >
  >;

  if (formData.get("type") === "slack") {
    const slackDeployHookRequest: SherlockSlackDeployHookV3Create = {
      ...formDataToObject(formData, true),
      ...partialTriggerConfig,
      onSuccess: formData.get("onSuccess") === "true",
      onFailure: formData.get("onFailure") === "true",
    };
    ret = new DeployHooksApi(SherlockConfiguration)
      .apiDeployHooksSlackV3Post(
        {
          slackDeployHook: slackDeployHookRequest,
        },
        handleIAP(request),
      )
      .then(
        (hook) => redirect(`${currentPagePath}/slack/${hook.id}`),
        makeErrorResponseReturner(slackDeployHookRequest),
      );
  } else if (formData.get("type") === "github-actions") {
    const workflowInputs = formData.get("githubActionsWorkflowInputs");
    const githubActionsDeployHookRequest: SherlockGithubActionsDeployHookV3Create =
      {
        ...formDataToObject(formData, true),
        ...partialTriggerConfig,
        onSuccess: formData.get("onSuccess") === "true",
        onFailure: formData.get("onFailure") === "true",
        githubActionsWorkflowInputs:
          typeof workflowInputs === "string" && workflowInputs
            ? JSON.parse(workflowInputs)
            : {},
      };
    ret = new DeployHooksApi(SherlockConfiguration)
      .apiDeployHooksGithubActionsV3Post(
        {
          githubActionsDeployHook: githubActionsDeployHookRequest,
        },
        handleIAP(request),
      )
      .then(
        (hook) => redirect(`${currentPagePath}/github-actions/${hook.id}`),
        makeErrorResponseReturner(githubActionsDeployHookRequest),
      );
  } else {
    throw new Error(`unknown deploy hook type ${formData.get("type")}`);
  }
  return ret;
}
