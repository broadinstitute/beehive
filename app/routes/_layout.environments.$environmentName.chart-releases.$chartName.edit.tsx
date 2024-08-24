import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object";
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
