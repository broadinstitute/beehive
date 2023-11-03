import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { SherlockGithubActionsDeployHookTestRunRequest } from "@sherlock-js-client/sherlock";
import { DeployHooksApi } from "@sherlock-js-client/sherlock";
import { buildNotifications } from "~/components/logic/notification";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { commitSession, sessionFields } from "~/session.server";
import { SherlockConfiguration, handleIAP } from "../../sherlock.server";

export async function testGithubActionsDeployHookAction(
  request: ActionFunctionArgs["request"],
  currentPagePath: string,
  id: string,
) {
  const session = await getValidSession(request);
  const formData = await request.formData();
  const body: SherlockGithubActionsDeployHookTestRunRequest = {
    execute: formData.get("execute") === "true",
  };
  return new DeployHooksApi(SherlockConfiguration)
    .apiDeployHooksGithubActionsProceduresV3TestSelectorPost(
      {
        selector: id,
        request: body,
      },
      handleIAP(request),
    )
    .then(async (response) => {
      session.flash(
        sessionFields.flashNotifications,
        buildNotifications({
          type: formData.get("execute") === "true" ? "gha" : "info",
          text:
            formData.get("execute") === "true"
              ? "Your GitHub Action has been started"
              : "The dry-run completed successfully",
          url: response.url ?? "",
        }),
      );
      return redirect(currentPagePath, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }, makeErrorResponseReturner(body));
}
