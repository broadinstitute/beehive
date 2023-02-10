import { Octokit } from "@octokit/rest";
import { ActionArgs } from "@remix-run/node";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { json } from "react-router";
import {
  buildNotifications,
  Notification,
} from "~/components/logic/notification";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { commitSession, sessionFields } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const session = await getValidSession(request);
  const formData = await request.formData();
  const environmentRequest: V2controllersEnvironment = {
    offline: formData.get("offline") === "true",
  };

  const environmentName = formData.get("environment");
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorPatch(
      {
        selector: typeof environmentName === "string" ? environmentName : "",
        environment: environmentRequest,
      },
      forwardIAP(request)
    )
    .then(async (environment) => {
      const payload = {
        owner: "broadinstitute",
        repo: "terra-github-workflows",
        workflow_id: ".github/workflows/bee-start-stop.yaml",
        ref: "main",
        inputs: {
          "bee-name": `${environment.name}`,
          offline: `${environment.offline}`,
        },
      };
      console.log(
        `environment stop-start workflow dispatch: ${JSON.stringify(payload)}`
      );
      const notification = await new Octokit({
        auth: session.get(sessionFields.githubAccessToken),
      }).actions
        .createWorkflowDispatch(payload)
        .then(
          (): Notification => ({
            type: "gha",
            text: `A GitHub Action has been started to ${
              environment.offline ? "stop" : "start"
            } your BEE`,
            url: "https://github.com/broadinstitute/terra-github-workflows/actions/workflows/bee-start-stop.yaml",
          }),
          (rejected): Notification => ({
            type: "error",
            text: `There was a problem calling the GitHub Action to provision your BEE: ${JSON.stringify(
              rejected
            )}`,
            error: true,
          })
        );
      session.flash(
        sessionFields.flashNotifications,
        buildNotifications(notification)
      );
      return json(
        {},
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }, errorResponseThrower);
}
