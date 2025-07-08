import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { defer } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { ServiceAlertApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ServiceAlertColors } from "~/features/sherlock/service-alerts/service-alert-colors";
import { ServiceAlertDetails } from "~/features/sherlock/service-alerts/view/service-alert-details";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/service-alerts/${params.serviceAlertId}`}>
      {params.serviceAlertId}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.serviceAlertId} - Service Alert` },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const selector = params.serviceAlertId || "";

  if (!selector) {
    throw new Response("Service Alert ID is required", { status: 400 });
  }

  return defer({
    serviceAlert: await new ServiceAlertApi(SherlockConfiguration)
      .apiServiceAlertsV3SelectorGet({ selector }, handleIAP(request))
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { serviceAlert } = useLoaderData<typeof loader>();
  return (
    <>
      <OutsetPanel {...ServiceAlertColors}>
        <ItemDetails
          subtitle={`Service Alert for ${serviceAlert.onEnvironment || "Unknown Environment"}`}
          title={serviceAlert.title || `Service Alert ${serviceAlert.id}`}
        >
          <ServiceAlertDetails
            serviceAlert={serviceAlert}
            toEdit="./edit"
            toDelete="./delete"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ serviceAlert }} />
    </>
  );
}

export function useServiceAlertContext() {
  return useOutletContext<{
    serviceAlert: SerializeFrom<typeof loader>["serviceAlert"];
  }>();
}
