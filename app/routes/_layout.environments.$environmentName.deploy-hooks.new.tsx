import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction, Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import { CiRunsApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { DeployHooksNewPanel } from "~/features/sherlock/deploy-hooks/new/deploy-hooks-new-panel";
import { newDeployHookAction } from "~/features/sherlock/deploy-hooks/new/new-deploy-hook-action.server";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/deploy-hooks/new`}>
      Add New
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Deploy Hooks - New` },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return new CiRunsApi(SherlockConfiguration)
    .apiCiRunsProceduresV3GithubInfoGet(handleIAP(request))
    .catch(errorResponseThrower);
}

export async function action({ request, params }: ActionFunctionArgs) {
  return newDeployHookAction(
    request,
    `/environments/${params.environmentName}/deploy-hooks`,
    {
      onEnvironment: params.environmentName ?? "",
    },
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const githubInfo = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();

  return <DeployHooksNewPanel githubInfo={githubInfo} errorInfo={errorInfo} />;
}
