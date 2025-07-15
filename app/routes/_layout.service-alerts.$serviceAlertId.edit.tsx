import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import type { SherlockServiceAlertV3EditableFields } from "@sherlock-js-client/sherlock";
import { ServiceAlertApi } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  ServiceAlertEditableFields,
  serviceAlertEditableFormDataToObject,
} from "~/features/sherlock/service-alerts/edit/service-alert-editable-fields";
import { ServiceAlertColors } from "~/features/sherlock/service-alerts/service-alert-colors";
import { syncServiceAlerts } from "~/features/sherlock/service-alerts/sync-service-alerts.server";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useServiceAlertContext } from "~/routes/_layout.service-alerts.$serviceAlertId";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => {
    return (
      <NavLink to={`/service-alerts/${params.serviceAlertId}/edit`}>
        Edit
      </NavLink>
    );
  },
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.serviceAlertId} - Service Alert - Edit` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const serviceAlertRequest: SherlockServiceAlertV3EditableFields =
    serviceAlertEditableFormDataToObject(formData);

  try {
    const serviceAlert = await new ServiceAlertApi(
      SherlockConfiguration,
    ).apiServiceAlertsV3SelectorPatch(
      {
        selector: params.serviceAlertId || "",
        serviceAlert: serviceAlertRequest,
      },
      handleIAP(request),
    );

    // Sync service alerts after update
    if (serviceAlert.onEnvironment) {
      await syncServiceAlerts(request, serviceAlert.onEnvironment);
    }

    return redirect(`/service-alerts/${serviceAlert.id}`);
  } catch (error) {
    return makeErrorResponseReturner(serviceAlertRequest)(error);
  }
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { serviceAlert } = useServiceAlertContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${serviceAlert.title || `Service Alert ${serviceAlert.id}`}`}
          submitText="Click to Save Edits"
          {...ServiceAlertColors}
        >
          <ServiceAlertEditableFields
            serviceAlert={errorInfo?.formState ?? serviceAlert}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
