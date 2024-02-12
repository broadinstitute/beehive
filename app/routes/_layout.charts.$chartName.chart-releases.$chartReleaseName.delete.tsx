import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { runGha } from "~/features/github/run-gha";
import { ChartReleaseDeletePanel } from "~/features/sherlock/chart-releases/delete/chart-release-delete-panel";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartChartReleaseContext } from "~/routes/_layout.charts.$chartName.chart-releases.$chartReleaseName";
import { commitSession } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/delete`}
    >
      Delete
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Delete`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getValidSession(request);

  return new ChartReleasesApi(SherlockConfiguration)
    .apiChartReleasesV3SelectorDelete(
      {
        selector: `${params.chartReleaseName}`,
      },
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
      return redirect(`/charts/${params.chartName}/chart-releases`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }, makeErrorResponseReturner());
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useChartChartReleaseContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <ChartReleaseDeletePanel
      chartRelease={chartRelease}
      errorInfo={errorInfo}
    />
  );
}
