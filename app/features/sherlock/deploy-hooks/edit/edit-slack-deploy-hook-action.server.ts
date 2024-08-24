import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { SherlockSlackDeployHookV3Edit } from "@sherlock-js-client/sherlock";
import { DeployHooksApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { SherlockConfiguration, handleIAP } from "../../sherlock.server";

export async function editSlackDeployHookAction(
  request: ActionFunctionArgs["request"],
  currentPagePath: string,
  id: string,
) {
  await getValidSession(request);
  const formData = await request.formData();
  const slackDeployHookRequest: SherlockSlackDeployHookV3Edit = {
    ...formDataToObject(formData, true),
    mentionPeople: formData.get("mentionPeople") === "true",
    onSuccess: formData.get("onSuccess") === "true",
    onFailure: formData.get("onFailure") === "true",
  };
  return new DeployHooksApi(SherlockConfiguration)
    .apiDeployHooksSlackV3SelectorPatch(
      {
        selector: id,
        slackDeployHook: slackDeployHookRequest,
      },
      handleIAP(request),
    )
    .then(
      (hook) => redirect(`${currentPagePath}/slack/${hook.id}?saved=true`),
      makeErrorResponseReturner(slackDeployHookRequest),
    );
}
