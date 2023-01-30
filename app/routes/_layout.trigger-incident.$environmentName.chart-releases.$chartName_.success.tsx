import { V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params } from "@remix-run/react";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { IncidentTriggerSuccessPanel } from "../features/sherlock/pagerduty-integrations/trigger-incident/incident-trigger-success-panel";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/trigger-incident/${params.environmentName}/chart-releases/${params.chartName}/success`}
    >
      Incident Triggered
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Incident Triggered`,
  },
];

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  return <IncidentTriggerSuccessPanel {...ChartReleaseColors} />;
}
