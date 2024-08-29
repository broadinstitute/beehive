import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import type { SherlockChartVersionV3 } from "@sherlock-js-client/sherlock";
import { ChartVersionsApi } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ChartVersionColors } from "~/features/sherlock/chart-versions/chart-version-colors";
import { ChartVersionEditableFields } from "~/features/sherlock/chart-versions/edit/chart-version-editable-fields";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartChartVersionContext } from "~/routes/_layout.charts.$chartName.chart-versions.$chartVersion";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => {
    return (
      <NavLink
        to={`/charts/${params.chartName}/chart-versions/${params.chartVersion}/edit`}
      >
        Edit
      </NavLink>
    );
  },
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartName}/${params.chartVersion} - Chart Version - Edit`,
  },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const chartVersionRequest: SherlockChartVersionV3 = {
    ...formDataToObject(formData, false),
  };

  return new ChartVersionsApi(SherlockConfiguration)
    .apiChartVersionsV3SelectorPatch(
      {
        selector: `${params.chartName}/${params.chartVersion}`,
        chartVersion: chartVersionRequest,
      },
      handleIAP(request),
    )
    .then(
      (chartVersion) =>
        redirect(
          `/charts/${params.chartName}/chart-versions/${chartVersion.chartVersion}`,
        ),
      makeErrorResponseReturner(chartVersionRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chart, chartVersion } = useChartChartVersionContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${chart.name}/${chartVersion.chartVersion}`}
          submitText="Click to Save Edits"
          {...ChartVersionColors}
        >
          <ChartVersionEditableFields
            chartVersion={errorInfo?.formState ?? chartVersion}
            repo={
              chart.chartRepo === "terra-helm"
                ? "broadinstitute/terra-helmfile"
                : undefined
            }
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
