import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PagerdutyIntegrationDeleteDescription } from "~/features/sherlock/pagerduty-integrations/delete/pagerduty-integration-delete-description";
import { PagerdutyIntegrationColors } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import {
  SherlockConfiguration,
  handleIAP,
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

export const meta: MetaFunction = () => [
  { title: "Details - PagerDuty Integration - Delete" },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiPagerdutyIntegrationsV3SelectorDelete(
      { selector: `pd-id/${params.pagerdutyID}` },
      handleIAP(request),
    )
    .then(
      () => redirect("/pagerduty-integrations"),
      makeErrorResponseReturner(),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { pagerdutyIntegration } = usePagerdutyIntegrationContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
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
      <OutsetFiller />
    </>
  );
}
