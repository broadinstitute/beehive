import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, useActionData } from "@remix-run/react";
import { ChartsApi, SherlockChartV3 } from "@sherlock-js-client/sherlock";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { ChartEditableFields } from "~/features/sherlock/charts/edit/chart-editable-fields";
import { ChartCreatableFields } from "~/features/sherlock/charts/new/chart-creatable-fields";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";

export const handle = {
  breadcrumb: () => <NavLink to="/charts/new">New</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "New Chart",
  },
];

export async function action({ request }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const chartRequest: SherlockChartV3 = {
    ...formDataToObject(formData, true),
    chartExposesEndpoint: formData.get("chartExposesEndpoint") === "true",
    legacyConfigsEnabled: formData.get("legacyConfigsEnabled") === "true",
    defaultPort: ((defaultPort) =>
      typeof defaultPort === "string" && defaultPort !== ""
        ? parseInt(defaultPort)
        : undefined)(formData.get("defaultPort")),
  };

  return new ChartsApi(SherlockConfiguration)
    .apiChartsV3Post({ chart: chartRequest }, handleIAP(request))
    .then(
      (chart) => redirect(`/charts/${chart.name}`),
      makeErrorResponseReturner(chartRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel {...ChartColors}>
        <ActionBox
          title="Now Creating New Chart"
          submitText="Click to Create"
          {...ChartColors}
        >
          <ChartCreatableFields chart={errorInfo?.formState} />
          <p className="py-4">Fields below this point can be edited later.</p>
          <ChartEditableFields chart={errorInfo?.formState} />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel>
        <FillerText>
          <p>
            Creating a new chart here lets us track and (attempt) deployments of
            it. It doesn't create the chart files itself.
          </p>
          <p>
            The chart repo needs to be one recognized by DevOps's systems
            (Thelma, specifically). Contact us if you're trying to deploy
            something external.
          </p>
        </FillerText>
      </InsetPanel>
    </>
  );
}
