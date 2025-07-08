import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { NavLink, useActionData } from "@remix-run/react";
import type { SherlockServiceAlertV3Create } from "@sherlock-js-client/sherlock";
import { ServiceAlertApi } from "@sherlock-js-client/sherlock";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  ServiceAlertCreatableFields,
  serviceAlertCreatableFormDataToObject,
} from "~/features/sherlock/service-alerts/new/service-alert-creatable-fields";
import { ServiceAlertColors } from "~/features/sherlock/service-alerts/service-alert-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";

export const handle = {
  breadcrumb: () => <NavLink to="/service-alerts/new">New</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "New Service Alert",
  },
];

export async function action({ request }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const serviceAlertRequest: SherlockServiceAlertV3Create =
    serviceAlertCreatableFormDataToObject(formData);

  return new ServiceAlertApi(SherlockConfiguration)
    .apiServiceAlertsV3Post(
      { serviceAlert: serviceAlertRequest },
      handleIAP(request),
    )
    .then(
      (serviceAlert) => redirect(`/service-alerts/${serviceAlert.id}`),
      makeErrorResponseReturner(serviceAlertRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel {...ServiceAlertColors}>
        <ActionBox
          title="Now Creating New Service Alert"
          submitText="Click to Create"
          {...ServiceAlertColors}
        >
          <ServiceAlertCreatableFields serviceAlert={errorInfo?.formState} />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel>
        <FillerText>
          <p>
            Creating a new service alert here lets Sherlock track and manage
            alert configurations for your services across environments.
          </p>
          <p>
            Service alerts can be configured to page on-call engineers and
            notify Slack channels based on different severity levels.
          </p>
          <p>
            For detailed configuration options, refer to the Sherlock
            documentation or contact the DevOps team.
          </p>
        </FillerText>
      </InsetPanel>
    </>
  );
}
