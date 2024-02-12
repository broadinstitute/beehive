import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { EnvironmentsApi } from "@sherlock-js-client/sherlock";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { runGha } from "~/features/github/run-gha";
import { EnvironmentDeleteDescription } from "~/features/sherlock/environments/delete/environment-delete-description";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { commitSession } from "~/session.server";
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

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Delete` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getValidSession(request);

  const environmentsApi = new EnvironmentsApi(SherlockConfiguration);

  return environmentsApi
    .apiEnvironmentsV3SelectorGet(
      { selector: params.environmentName || "" },
      handleIAP(request),
    )
    .then(async (environment) => {
      if (environment.lifecycle === "dynamic") {
        await runGha(
          session,
          {
            workflow_id: ".github/workflows/bee-destroy.yaml",
            inputs: {
              "bee-name": environment.name || "",
            },
          },
          "delete your BEE",
        );
        return redirect("/environments", {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      } else {
        return await environmentsApi
          .apiEnvironmentsV3SelectorDelete(
            { selector: params.environmentName || "" },
            handleIAP(request),
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
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${environment.name}`}
          submitText={`Click to Delete`}
          {...EnvironmentColors}
        >
          <EnvironmentDeleteDescription environment={environment} />
          {(environment.lifecycle !== "dynamic" || environment.offline) && (
            <DeletionGuard name={environment.name} />
          )}
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
