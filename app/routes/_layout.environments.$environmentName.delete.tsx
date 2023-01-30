import { Octokit } from "@octokit/rest";
import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import { EnvironmentsApi } from "@sherlock-js-client/sherlock";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetPanel } from "~/components/layout/outset-panel";
import {
  buildNotifications,
  Notification,
} from "~/components/logic/notification";
import { ActionBox } from "~/components/panel-structures/action-box";
import { EnvironmentDeleteDescription } from "~/features/sherlock/environments/delete/environment-delete-description";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { commitSession, sessionFields } from "~/session.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import { makeErrorResponseReturner } from "../errors/helpers/error-response-handlers";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentContext } from "./_layout.environments.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/delete`}>
      Delete
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Delete` },
];

export async function action({ request, params }: ActionArgs) {
  const session = await getValidSession(request);

  const environmentsApi = new EnvironmentsApi(SherlockConfiguration);

  return environmentsApi
    .apiV2EnvironmentsSelectorGet(
      { selector: params.environmentName || "" },
      forwardIAP(request)
    )
    .then(async (environment) => {
      if (environment.lifecycle === "dynamic") {
        const payload = {
          owner: "broadinstitute",
          repo: "terra-github-workflows",
          workflow_id: ".github/workflows/bee-destroy.yaml",
          ref: "main",
          inputs: {
            "bee-name": environment.name || "",
          },
        };
        console.log(
          `environment delete workflow dispatch: ${JSON.stringify(payload)}`
        );
        const notification = await new Octokit({
          auth: session.get(sessionFields.githubAccessToken),
        }).actions
          .createWorkflowDispatch(payload)
          .then(
            (): Notification => ({
              type: "gha",
              text: "A GitHub Action has been started to delete your BEE",
              url: "https://github.com/broadinstitute/terra-github-workflows/actions/workflows/bee-destroy.yaml",
            }),
            (rejected): Notification => ({
              type: "error",
              text: `There was a problem calling the GitHub Action to delete your BEE: ${JSON.stringify(
                rejected
              )}`,
              error: true,
            })
          );
        session.flash(
          sessionFields.flashNotifications,
          buildNotifications(notification)
        );
        return redirect("/environments", {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      } else {
        return await environmentsApi
          .apiV2EnvironmentsSelectorDelete(
            { selector: params.environmentName || "" },
            forwardIAP(request)
          )
          .then(() => redirect("/environments"), makeErrorResponseReturner());
      }
    }, makeErrorResponseReturner());
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { environment } = useEnvironmentContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <OutsetPanel>
      <ActionBox
        title={`Now Deleting ${environment.name}`}
        submitText={`Click to Delete`}
        {...EnvironmentColors}
      >
        <EnvironmentDeleteDescription environment={environment} />
        {environment.lifecycle !== "dynamic" && (
          <DeletionGuard name={environment.name} />
        )}
        {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
      </ActionBox>
    </OutsetPanel>
  );
}
