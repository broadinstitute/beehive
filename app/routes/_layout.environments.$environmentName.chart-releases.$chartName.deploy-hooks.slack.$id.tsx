import { type ActionArgs, type LoaderArgs } from "@remix-run/node";
import type { Params, V2_MetaFunction } from "@remix-run/react";
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
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/deploy-hooks/slack/${params.id}`}
    >
      Slack Hook
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Chart Instance - Deploy Hooks - Slack Hook`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new DeployHooksApi(SherlockConfiguration)
    .apiDeployHooksSlackV3SelectorGet(
      {
        selector: params.id ?? "",
      },
      handleIAP(request),
    )
    .catch(errorResponseThrower);
}

export async function action({ request, params }: ActionArgs) {
  return editSlackDeployHookAction(
    request,
    `/environments/${params.environmentName}/chart-releases/${params.chartName}/deploy-hooks`,
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
