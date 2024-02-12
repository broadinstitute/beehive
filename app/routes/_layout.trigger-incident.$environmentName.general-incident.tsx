import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import type { PagerdutyAlertSummary } from "@sherlock-js-client/sherlock";
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import { makeErrorResponseReturner } from "../errors/helpers/error-response-handlers";
import { IncidentSummaryFields } from "../features/sherlock/pagerduty-integrations/trigger-incident/incident-summary-fields";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useTriggerIncidentContext } from "./_layout.trigger-incident.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/trigger-incident/${params.environmentName}/general-incident`}
    >
      General Incident
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Trigger Incident - General`,
  },
];

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
        `/trigger-incident/${params.environmentName}/general-incident/success`,
      );
    }, makeErrorResponseReturner(summaryRequest));
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { environment } = useTriggerIncidentContext();
  const errorInfo = useActionData<typeof action>();

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Preparing to Trigger General Incident for ${environment.name}`}
          submitText="Click to Trigger General Incident"
          {...EnvironmentColors}
        >
          <input
            type="hidden"
            name="selector"
            value={environment.pagerdutyIntegration}
          />
          <IncidentSummaryFields
            initialSummary={errorInfo?.formState?.summary}
            link={`https://broad.io/beehive/r/environment/${environment.name}`}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
