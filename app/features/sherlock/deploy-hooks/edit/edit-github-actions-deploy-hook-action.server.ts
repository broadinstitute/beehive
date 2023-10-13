import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { SherlockGithubActionsDeployHookV3Edit } from "@sherlock-js-client/sherlock";
import { DeployHooksApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { SherlockConfiguration, handleIAP } from "../../sherlock.server";

export async function editGithubActionsDeployHookAction(
  request: ActionFunctionArgs["request"],
  currentPagePath: string,
  id: string,
) {
  await getValidSession(request);
  const formData = await request.formData();
  const workflowInputs = formData.get("githubActionsWorkflowInputs");
  const githubActionsDeployHookRequest: SherlockGithubActionsDeployHookV3Edit =
    {
      ...formDataToObject(formData, true),
      onSuccess: formData.get("onSuccess") === "true",
      onFailure: formData.get("onFailure") === "true",
      githubActionsWorkflowInputs:
        typeof workflowInputs === "string" && workflowInputs
          ? JSON.parse(workflowInputs)
          : {},
    };
  return new DeployHooksApi(SherlockConfiguration)
    .apiDeployHooksGithubActionsV3SelectorPatch(
      {
        selector: id,
        githubActionsDeployHook: githubActionsDeployHookRequest,
      },
      handleIAP(request),
    )
    .then(
      (hook) =>
        redirect(`${currentPagePath}/github-actions/${hook.id}?saved=true`),
      makeErrorResponseReturner(githubActionsDeployHookRequest),
    );
}
