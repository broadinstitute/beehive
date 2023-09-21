import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseEditPanel } from "~/features/sherlock/chart-releases/edit/chart-release-edit-panel";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
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

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance - Edit`,
  },
];

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const chartReleaseRequest: V2controllersChartRelease = {
    ...formDataToObject(formData, false),
    port: ((port) =>
      typeof port === "string" && port !== "" ? parseInt(port) : undefined)(
      formData.get("port"),
    ),
  };

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorPatch(
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
