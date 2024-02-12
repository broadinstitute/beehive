import type { RestEndpointMethodTypes } from "@octokit/rest";
import { Octokit } from "@octokit/rest";
import type { Notification } from "~/components/logic/notification";
import { buildNotifications } from "~/components/logic/notification";
import type { getValidSession } from "~/helpers/get-valid-session.server";
import { sessionFields } from "~/session.server";

export type GhaPayload =
  RestEndpointMethodTypes["actions"]["createWorkflowDispatch"]["parameters"];

export async function runGha(
  session: Awaited<ReturnType<typeof getValidSession>>,
  payload: Partial<GhaPayload>,
  actionDescription: string,
) {
  const realPayload: GhaPayload = {
    ...payload,
    owner: payload.owner ?? "broadinstitute",
    repo: payload.repo ?? "terra-github-workflows",
    workflow_id: payload.workflow_id ?? "",
    ref: payload.ref ?? "main",
  };
  if (!realPayload.workflow_id) {
    throw new Error("no workfload ID provided");
  }
  console.log(`workflow dispatch: ${JSON.stringify(payload)}`);
  const notification = await new Octokit({
    auth: session.get(sessionFields.githubAccessToken),
  }).actions
    .createWorkflowDispatch(realPayload)
    .then(
      (): Notification => ({
        type: "gha",
        text: `A GitHub Action has been started to ${actionDescription}`,
        url: `https://github.com/${realPayload.owner}/${
          realPayload.repo
        }/actions/workflows/${realPayload.workflow_id
          .toString()
          .split("/")
          .pop()}`,
      }),
      (rejected): Notification => ({
        type: "error",
        text: `There was a problem calling the GitHub Action to ${actionDescription}: ${JSON.stringify(
          rejected,
        )}`,
        error: true,
      }),
    );
  session.flash(
    sessionFields.flashNotifications,
    buildNotifications(notification),
  );
}
