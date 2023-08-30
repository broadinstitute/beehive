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
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/deploy-hooks`}
    >
      Deploy Hooks
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Chart Instance - Deploy Hooks`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  const deployHooksApi = new DeployHooksApi(SherlockConfiguration);
  return Promise.all([
    deployHooksApi.apiDeployHooksGithubActionsV3Get(
      {
        onChartRelease: `${params.environmentName}/${params.chartName}`,
      },
      handleIAP(request),
    ),
    deployHooksApi.apiDeployHooksSlackV3Get({
      onChartRelease: `${params.environmentName}/${params.chartName}`,
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
        resourceName={`${params.chartName} in ${params.environmentName}`}
      />
      <Outlet />
    </>
  );
}
