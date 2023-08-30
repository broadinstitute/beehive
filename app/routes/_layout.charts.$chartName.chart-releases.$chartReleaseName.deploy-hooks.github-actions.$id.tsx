import { type ActionArgs, type LoaderArgs } from "@remix-run/node";
import type { Params, V2_MetaFunction } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { CiRunsApi, DeployHooksApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { editGithubActionsDeployHookAction } from "~/features/sherlock/deploy-hooks/edit/edit-github-actions-deploy-hook-action.server";
import { GithubActionsDeployHookEditPanel } from "~/features/sherlock/deploy-hooks/edit/github-actions-deploy-hook-edit-panel";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/deploy-hooks/github-actions/${params.id}`}
    >
      Slack Hook
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Deploy Hooks - GitHub Actions Hook`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return Promise.all([
    new DeployHooksApi(SherlockConfiguration)
      .apiDeployHooksGithubActionsV3SelectorGet(
        {
          selector: params.id ?? "",
        },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
    new CiRunsApi(SherlockConfiguration)
      .apiCiRunsProceduresV3GithubInfoGet(handleIAP(request))
      .catch(errorResponseThrower),
  ]);
}

export async function action({ request, params }: ActionArgs) {
  return editGithubActionsDeployHookAction(
    request,
    `/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/deploy-hooks`,
    params.id ?? "",
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [githubActionsHook, githubInfo] = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();

  return (
    <>
      <GithubActionsDeployHookEditPanel
        githubActionsHook={githubActionsHook}
        githubInfo={githubInfo}
        errorInfo={errorInfo}
      />
      <Outlet />
    </>
  );
}
