import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PagerdutyIntegrationDeleteDescription } from "~/features/sherlock/pagerduty-integrations/delete/pagerduty-integration-delete-description";
import { PagerdutyIntegrationColors } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import { makeErrorResponseReturner } from "../errors/helpers/error-response-handlers";
import { getValidSession } from "../helpers/get-valid-session.server";
import { usePagerdutyIntegrationContext } from "./_layout.pagerduty-integrations.$pagerdutyID";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/pagerduty-integrations/${params.pagerdutyID}/delete`}>
      Delete
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = () => [
  { title: "Details - PagerDuty Integration - Delete" },
];

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiV2PagerdutyIntegrationsSelectorDelete(
      { selector: `pd-id/${params.pagerdutyID}` },
      forwardIAP(request)
    )
    .then(
      () => redirect("/pagerduty-integrations"),
      makeErrorResponseReturner()
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { pagerdutyIntegration } = usePagerdutyIntegrationContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <OutsetPanel>
      <ActionBox
        title={`Now Deleting ${pagerdutyIntegration.name} from Sherlock`}
        submitText="Click to Delete"
        {...PagerdutyIntegrationColors}
      >
        <PagerdutyIntegrationDeleteDescription />
        <DeletionGuard name={pagerdutyIntegration.name} />
        {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
      </ActionBox>
    </OutsetPanel>
  );
}
