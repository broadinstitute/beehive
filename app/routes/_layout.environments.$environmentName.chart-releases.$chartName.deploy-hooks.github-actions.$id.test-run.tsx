import { type ActionFunctionArgs } from "@remix-run/node";
import type { MetaFunction, Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { DeployHookTestPanel } from "~/features/sherlock/deploy-hooks/test-run/deploy-hook-test-panel";
import { testGithubActionsDeployHookAction } from "~/features/sherlock/deploy-hooks/test-run/test-github-actions-deploy-hook-action.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/deploy-hooks/github-actions/${params.id}/test-run`}
    >
      Test
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Chart Instance - Deploy Hooks - GitHub Actions Hook - Test`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
  return testGithubActionsDeployHookAction(
    request,
    `/environments/${params.environmentName}/chart-releases/${params.chartName}/deploy-hooks/github-actions/${params.id}/test-run`,
    params.id ?? "",
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const errorInfo = useActionData<typeof action>();

  return <DeployHookTestPanel errorInfo={errorInfo} type="GitHub Actions" />;
}
