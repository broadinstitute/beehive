import { Octokit } from "@octokit/rest";
import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useOutletContext,
} from "@remix-run/react";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import { EnvironmentDeleteDescription } from "~/components/content/environment/environment-delete-description";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import {
  buildNotifications,
  Notification,
} from "~/components/logic/notification";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { DerivedErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { commitSession, getSession, sessionFields } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/delete`}>
      Delete
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName} - Environment - Delete`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

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
          .then(() => redirect("/environments"), errorResponseReturner);
      }
    }, errorResponseReturner);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const DeleteRoute: React.FunctionComponent = () => {
  const { environment } = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const actionData = useActionData<DerivedErrorInfo>();
  return (
    <Branch>
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
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default DeleteRoute;
