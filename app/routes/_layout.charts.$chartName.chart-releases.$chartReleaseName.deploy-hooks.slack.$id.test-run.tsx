import { type ActionFunctionArgs } from "@remix-run/node";
import type { MetaFunction, Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { DeployHookTestPanel } from "~/features/sherlock/deploy-hooks/test/deploy-hook-test-panel";
import { testSlackDeployHookAction } from "~/features/sherlock/deploy-hooks/test/test-slack-deploy-hook-action.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/deploy-hooks/slack/${params.id}/test`}
    >
      Test
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Deploy Hooks - Slack Hook - Test`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
  return testSlackDeployHookAction(
    request,
    `/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/deploy-hooks/slack/${params.id}/test`,
    params.id ?? "",
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const errorInfo = useActionData<typeof action>();

  return <DeployHookTestPanel errorInfo={errorInfo} type="Slack" />;
}
