import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { PagerdutyAlertSummary } from "@sherlock-js-client/sherlock";
import {
  ChartReleasesApi,
  PagerdutyIntegrationsApi,
} from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { IncidentSummaryFields } from "../features/sherlock/pagerduty-integrations/trigger-incident/incident-summary-fields";
import { getValidSession } from "../helpers/get-valid-session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/trigger-incident/${params.environmentName}/chart-releases/${params.chartName}`}
    >
      {params.chartName}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Trigger Incident - Specific App`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiChartReleasesV3SelectorGet(
      { selector: `${params.environmentName}/${params.chartName}` },
      handleIAP(request),
    )
    .catch(errorResponseThrower);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const summaryRequest: PagerdutyAlertSummary = {
    ...formDataToObject(formData, true),
  };

  const selector = formData.get("selector");
  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiPagerdutyIntegrationsProceduresV3TriggerIncidentSelectorPost(
      {
        selector: typeof selector === "string" ? selector : "",
        summary: summaryRequest,
      },
      handleIAP(request),
    )
    .then((response) => {
      console.log(response);
      return redirect(
        `/trigger-incident/${params.environmentName}/chart-releases/${params.chartName}/success`,
      );
    }, makeErrorResponseReturner(summaryRequest));
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const chartRelease = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Preparing to Trigger Specific Incident for ${chartRelease.chart} in ${chartRelease.environment}`}
          submitText="Click to Trigger Incident"
          {...ChartReleaseColors}
        >
          <input
            type="hidden"
            name="selector"
            value={chartRelease.pagerdutyIntegration}
          />
          <IncidentSummaryFields
            initialSummary={errorInfo?.formState?.summary}
            link={`https://broad.io/beehive/r/chart-release/${chartRelease.name}`}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
