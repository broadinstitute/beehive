import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { ServiceAlertApi } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ProdFlag } from "~/components/layout/prod-flag";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ServiceAlertDeleteDescription } from "~/features/sherlock/service-alerts/delete/service-alert-delete-description";
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

  const selector = params.serviceAlertId || "";

  if (!selector) {
    return json(
      {
        formState: {},
        errorSummary: {
          title: "Service Alert ID Required",
          body: "A service alert ID is required to delete a service alert.",
        },
      },
      { status: 400 },
    );
  }

  try {
    // First get the service alert to capture the environment before deletion
    const serviceAlert = await new ServiceAlertApi(
      SherlockConfiguration,
    ).apiServiceAlertsV3SelectorGet({ selector }, handleIAP(request));

    // Delete the service alert
    await new ServiceAlertApi(
      SherlockConfiguration,
    ).apiServiceAlertsV3SelectorDelete({ selector }, handleIAP(request));

    // Try to sync service alerts after deletion
    if (serviceAlert?.onEnvironment) {
      try {
        await syncServiceAlerts(request, serviceAlert.onEnvironment);
      } catch (syncError) {
        // Log the sync error but don't fail the delete operation
        console.error(
          `Failed to sync service alerts after deletion for environment ${serviceAlert.onEnvironment}:`,
          syncError,
        );
        // You could optionally show a warning to the user here, but the delete was successful
      }
    }

    return redirect("/service-alerts");
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Response) {
      if (error.status === 404) {
        return json(
          {
            formState: {},
            errorSummary: {
              title: "Service Alert Not Found",
              body: "The service alert you're trying to delete was not found. It may have already been deleted.",
            },
          },
          { status: 404 },
        );
      }
    }

    return makeErrorResponseReturner({})(error);
  }
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { serviceAlert } = useServiceAlertContext();
  const errorInfo = useActionData<typeof action>();
  const isProd = Boolean(
    serviceAlert.onEnvironment?.trim()?.toLowerCase() === "prod",
  );

  return (
    <ProdFlag prod={isProd}>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${serviceAlert.title || `Service Alert ${serviceAlert.id}`}`}
          submitText="Click to Delete"
          {...ServiceAlertColors}
        >
          <ServiceAlertDeleteDescription
            serviceAlert={serviceAlert}
            showEnvironmentWarning={isProd}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </ProdFlag>
  );
}
