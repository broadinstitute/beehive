import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { ServiceAlertApi } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ServiceAlertDeleteDescription } from "~/features/sherlock/service-alerts/delete/service-alert-delete-description";
import { ServiceAlertColors } from "~/features/sherlock/service-alerts/service-alert-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useServiceAlertContext } from "~/routes/_layout.service-alerts.$serviceAlertId";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => {
    return (
      <NavLink to={`/service-alerts/${params.serviceAlertId}/delete`}>
        Delete
      </NavLink>
    );
  },
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.serviceAlertId} - Service Alert - Delete` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  return new ServiceAlertApi(SherlockConfiguration)
    .apiServiceAlertsV3SelectorDelete(
      { selector: params.serviceAlertId || "" },
      handleIAP(request),
    )
    .then(() => redirect("/service-alerts"), makeErrorResponseReturner({}));
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { serviceAlert } = useServiceAlertContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${serviceAlert.title || `Service Alert ${serviceAlert.id}`}`}
          submitText="Click to Delete"
          {...ServiceAlertColors}
        >
          <ServiceAlertDeleteDescription serviceAlert={serviceAlert} />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
