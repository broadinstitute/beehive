import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import {
  EnvironmentsApi,
  PagerdutyAlertSummary,
} from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  forwardIAP,
  SherlockConfiguration,
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

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Trigger Incident - General`,
  },
];

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const summaryRequest: PagerdutyAlertSummary = {
    ...formDataToObject(formData, true),
  };

  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2ProceduresEnvironmentsTriggerIncidentSelectorPost(
      {
        selector: params.environmentName || "",
        summary: summaryRequest,
      },
      forwardIAP(request)
    )
    .then((response) => {
      console.log(response);
      return redirect(
        `/trigger-incident/${params.environmentName}/general-incident/success`
      );
    }, makeErrorResponseReturner(summaryRequest));
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { environment } = useTriggerIncidentContext();
  const errorInfo = useActionData<typeof action>();

  return (
    <>
      {" "}
      <OutsetPanel>
        <ActionBox
          title={`Preparing to Trigger General Incident for ${environment.name}`}
          submitText="Click to Trigger General Incident"
          {...EnvironmentColors}
        >
          <IncidentSummaryFields
            initialSummary={errorInfo?.formState?.summary}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
