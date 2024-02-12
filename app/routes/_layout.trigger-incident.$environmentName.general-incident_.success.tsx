import type { MetaFunction } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink } from "@remix-run/react";
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

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Incident Triggered`,
  },
];

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  return <IncidentTriggerSuccessPanel />;
}
