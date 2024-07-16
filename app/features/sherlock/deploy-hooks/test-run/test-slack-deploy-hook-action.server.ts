import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { SherlockSlackDeployHookTestRunRequest } from "@sherlock-js-client/sherlock";
import { DeployHooksApi } from "@sherlock-js-client/sherlock";
import { buildNotifications } from "~/components/logic/notification";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { commitSession, sessionFields } from "~/session.server";
import { SherlockConfiguration, handleIAP } from "../../sherlock.server";

export async function testSlackDeployHookAction(
  request: ActionFunctionArgs["request"],
  currentPagePath: string,
  id: string,
) {
  const session = await getValidSession(request);
  const formData = await request.formData();
  const body: SherlockSlackDeployHookTestRunRequest = {
    execute: formData.get("execute") === "true",
  };
  return new DeployHooksApi(SherlockConfiguration)
    .apiDeployHooksSlackProceduresV3TestSelectorPost(
      {
        selector: id,
        request: body,
      },
      handleIAP(request),
    )
    .then(async () => {
      session.flash(
        sessionFields.flashNotifications,
        buildNotifications({
          type: "info",
          text:
            formData.get("execute") === "true"
              ? "A Slack message has been sent"
              : "The dry-run completed successfully",
        }),
      );
      return redirect(currentPagePath, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }, makeErrorResponseReturner(body));
}
