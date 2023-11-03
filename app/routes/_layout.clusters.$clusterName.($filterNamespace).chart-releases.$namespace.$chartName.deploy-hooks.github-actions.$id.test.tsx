import { type ActionFunctionArgs } from "@remix-run/node";
import type { MetaFunction, Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { DeployHookTestPanel } from "~/features/sherlock/deploy-hooks/test/deploy-hook-test-panel";
import { testGithubActionsDeployHookAction } from "~/features/sherlock/deploy-hooks/test/test-github-actions-deploy-hook-action.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}/deploy-hooks/github-actions/${params.id}/test`}
    >
      Test
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance - Deploy Hooks - GitHub Actions Hook - Test`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
  return testGithubActionsDeployHookAction(
    request,
    `/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}/deploy-hooks/github-actions/${params.id}/test`,
    params.id ?? "",
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const errorInfo = useActionData<typeof action>();

  return <DeployHookTestPanel errorInfo={errorInfo} type="GitHub Actions" />;
}
