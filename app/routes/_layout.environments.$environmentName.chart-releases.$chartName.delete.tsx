import { ActionFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { runGha } from "~/features/github/run-gha";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { commitSession } from "~/session.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { makeErrorResponseReturner } from "../errors/helpers/error-response-handlers";
import { ChartReleaseDeletePanel } from "../features/sherlock/chart-releases/delete/chart-release-delete-panel";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentChartReleaseContext } from "./_layout.environments.$environmentName.chart-releases.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/delete`}
    >
      Delete
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Chart Instance - Delete`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getValidSession(request);

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorDelete(
      { selector: `${params.environmentName}/${params.chartName}` },
      handleIAP(request),
    )
    .then(async (chartRelease) => {
      if (chartRelease.environmentInfo?.lifecycle === "dynamic") {
        await runGha(
          session,
          {
            workflow_id: ".github/workflows/bee-sync.yaml",
            inputs: {
              "bee-name": chartRelease.environmentInfo?.name || "",
            },
          },
          "sync your BEE",
        );
      }
      return redirect(
        `/environments/${params.environmentName}/chart-releases`,
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        },
      );
    }, makeErrorResponseReturner());
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useEnvironmentChartReleaseContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <ChartReleaseDeletePanel
      chartRelease={chartRelease}
      errorInfo={errorInfo}
    />
  );
}
