import { ActionFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useEnvironmentChartReleaseContext } from "~/routes/_layout.environments.$environmentName.chart-releases.$chartName";
import { ChartReleaseEditPanel } from "../features/sherlock/chart-releases/edit/chart-release-edit-panel";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/edit`}
    >
      Edit
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Chart Instance - Edit`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
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
        selector: `${params.environmentName}/${params.chartName}`,
        chartRelease: chartReleaseRequest,
      },
      handleIAP(request),
    )
    .then(
      () =>
        redirect(
          `/environments/${params.environmentName}/chart-releases/${params.chartName}`,
        ),
      makeErrorResponseReturner(chartReleaseRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useEnvironmentChartReleaseContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <ChartReleaseEditPanel chartRelease={chartRelease} errorInfo={errorInfo} />
  );
}
