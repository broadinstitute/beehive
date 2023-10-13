import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import type { MetaFunction, Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { DeployHooksApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { DeployHookDeletePanel } from "~/features/sherlock/deploy-hooks/delete/deploy-hook-delete-panel";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/deploy-hooks/slack/${params.id}/delete`}
    >
      Delete
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Environment - Deploy Hooks - Slack Hook - Delete`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  return new DeployHooksApi(SherlockConfiguration)
    .apiDeployHooksSlackV3SelectorDelete(
      {
        selector: params.id ?? "",
      },
      handleIAP(request),
    )
    .then(
      () => redirect(`/environments/${params.environmentName}/deploy-hooks`),
      makeErrorResponseReturner(),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const errorInfo = useActionData<typeof action>();

  return <DeployHookDeletePanel errorInfo={errorInfo} type="Slack" />;
}
