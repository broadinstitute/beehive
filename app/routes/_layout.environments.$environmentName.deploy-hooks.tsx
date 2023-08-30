import type { LoaderArgs } from "@remix-run/node";
import type { Params, V2_MetaFunction } from "@remix-run/react";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { DeployHooksApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { DeployHooksListPanel } from "~/features/sherlock/deploy-hooks/list/deploy-hooks-list-panel";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/deploy-hooks`}>
      Deploy Hooks
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Deploy Hooks` },
];

export async function loader({ request, params }: LoaderArgs) {
  const deployHooksApi = new DeployHooksApi(SherlockConfiguration);
  return Promise.all([
    deployHooksApi.apiDeployHooksGithubActionsV3Get(
      {
        onEnvironment: params.environmentName,
      },
      handleIAP(request),
    ),
    deployHooksApi.apiDeployHooksSlackV3Get({
      onEnvironment: params.environmentName,
    }),
  ]).catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [githubHooks, slackHooks] = useLoaderData<typeof loader>();
  const params = useParams();
  return (
    <>
      <DeployHooksListPanel
        hooks={[...githubHooks, ...slackHooks]}
        resourceName={params.environmentName}
      />
      <Outlet />
    </>
  );
}
