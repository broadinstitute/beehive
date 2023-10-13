import type { LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction, Params } from "@remix-run/react";
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
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}/deploy-hooks`}
    >
      Deploy Hooks
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance - Deploy Hooks`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const deployHooksApi = new DeployHooksApi(SherlockConfiguration);
  return Promise.all([
    deployHooksApi.apiDeployHooksGithubActionsV3Get(
      {
        onChartRelease: `${params.clusterName}/${params.namespace}/${params.chartName}`,
      },
      handleIAP(request),
    ),
    deployHooksApi.apiDeployHooksSlackV3Get(
      {
        onChartRelease: `${params.clusterName}/${params.namespace}/${params.chartName}`,
      },
      handleIAP(request),
    ),
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
        resourceName={`${params.chartName} in ${params.namespace}`}
      />
      <Outlet />
    </>
  );
}
