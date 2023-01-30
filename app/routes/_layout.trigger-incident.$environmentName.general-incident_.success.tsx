import { V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params } from "@remix-run/react";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { IncidentTriggerSuccessPanel } from "../features/sherlock/pagerduty-integrations/trigger-incident/incident-trigger-success-panel";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/trigger-incident/${params.environmentName}/general-incident/success`}
    >
      Incident Triggered
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Incident Triggered`,
  },
];

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  return <IncidentTriggerSuccessPanel />;
}
