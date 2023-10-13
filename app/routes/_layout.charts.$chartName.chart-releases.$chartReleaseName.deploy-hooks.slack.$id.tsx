import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import type { MetaFunction, Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { DeployHooksApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { editSlackDeployHookAction } from "~/features/sherlock/deploy-hooks/edit/edit-slack-deploy-hook-action.server";
import { SlackDeployHookEditPanel } from "~/features/sherlock/deploy-hooks/edit/slack-deploy-hook-edit-panel";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/deploy-hooks/slack/${params.id}`}
    >
      Slack Hook
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Deploy Hooks - Slack Hook`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new DeployHooksApi(SherlockConfiguration)
    .apiDeployHooksSlackV3SelectorGet(
      {
        selector: params.id ?? "",
      },
      handleIAP(request),
    )
    .catch(errorResponseThrower);
}

export async function action({ request, params }: ActionFunctionArgs) {
  return editSlackDeployHookAction(
    request,
    `/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/deploy-hooks`,
    params.id ?? "",
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const slackHook = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <SlackDeployHookEditPanel slackHook={slackHook} errorInfo={errorInfo} />
      <Outlet />
    </>
  );
}
