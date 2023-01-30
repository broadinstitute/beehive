import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseDeletePanel } from "~/features/sherlock/chart-releases/delete/chart-release-delete-panel";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useClusterChartReleaseContext } from "~/routes/_layout.clusters.$clusterName.($filterNamespace).chart-releases.$namespace.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}/delete`}
    >
      Delete
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance - Delete`,
  },
];

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorDelete(
      {
        selector: `${params.clusterName}/${params.namespace}/${params.chartName}`,
      },
      forwardIAP(request)
    )
    .then(
      () => redirect(`/clusters/${params.clusterName}/chart-releases`),
      makeErrorResponseReturner()
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useClusterChartReleaseContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <ChartReleaseDeletePanel
      chartRelease={chartRelease}
      errorInfo={errorInfo}
    />
  );
}