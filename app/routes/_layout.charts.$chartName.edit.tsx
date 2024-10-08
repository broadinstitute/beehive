import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import type { SherlockChartV3 } from "@sherlock-js-client/sherlock";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { ChartEditableFields } from "~/features/sherlock/charts/edit/chart-editable-fields";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartContext } from "~/routes/_layout.charts.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => {
    return <NavLink to={`/charts/${params.chartName}/edit`}>Edit</NavLink>;
  },
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.chartName} - Chart - Edit` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const chartRequest: SherlockChartV3 = {
    ...formDataToObject(formData, false),
    chartExposesEndpoint: formData.get("chartExposesEndpoint") === "true",
    defaultPort: ((defaultPort) =>
      typeof defaultPort === "string" && defaultPort !== ""
        ? parseInt(defaultPort)
        : undefined)(formData.get("defaultPort")),
  };
  return new ChartsApi(SherlockConfiguration)
    .apiChartsV3SelectorPatch(
      {
        selector: params.chartName || "",
        chart: chartRequest,
      },
      handleIAP(request),
    )
    .then(
      (chart) => redirect(`/charts/${chart.name}`),
      makeErrorResponseReturner(chartRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chart } = useChartContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${chart.name}`}
          submitText="Click to Save Edits"
          {...ChartColors}
        >
          <ChartEditableFields chart={errorInfo?.formState ?? chart} />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
