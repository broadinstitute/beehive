import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseEditPanel } from "~/features/sherlock/chart-releases/edit/chart-release-edit-panel";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useClusterChartReleaseContext } from "~/routes/_layout.clusters.$clusterName.($filterNamespace).chart-releases.$namespace.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}/edit`}
    >
      Edit
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance - Edit`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const chartReleaseRequest: SherlockChartReleaseV3 = {
    ...formDataToObject(formData, false),
    port: ((port) =>
      typeof port === "string" && port !== "" ? parseInt(port) : undefined)(
      formData.get("port"),
    ),
  };

  return new ChartReleasesApi(SherlockConfiguration)
    .apiChartReleasesV3SelectorPatch(
      {
        selector: `${params.clusterName}/${params.namespace}/${params.chartName}`,
        chartRelease: chartReleaseRequest,
      },
      handleIAP(request),
    )
    .then(
      () =>
        redirect(
          `/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}`,
        ),
      makeErrorResponseReturner(chartReleaseRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useClusterChartReleaseContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <ChartReleaseEditPanel chartRelease={chartRelease} errorInfo={errorInfo} />
  );
}
