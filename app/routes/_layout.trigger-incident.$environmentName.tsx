import {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { EnvironmentsApi } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/trigger-incident/${params.environmentName}`}>
      {params.environmentName}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Trigger Incident` },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorGet(
      { selector: params.environmentName || "" },
      handleIAP(request),
    )
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const environment = useLoaderData<typeof loader>();
  return (
    <>
      <OutsetPanel {...EnvironmentColors}>
        <ItemDetails
          subtitle="Trigger PagerDuty Incident"
          title={environment.name || ""}
        >
          <h2 className="pt-8 text-2xl font-light">General Incident</h2>
          <p className="font-semibold">
            Triggering a general incident should be the default unless you know
            the specific internal component of Terra that's having trouble.
          </p>
          <p>
            This kind of incident will always page Terra's general on-call
            engineer (for "{environment.pagerdutyIntegrationInfo?.name}").
            They'll be able to investigate the issue and escalate appropriately.
          </p>
          <NavButton to="./general-incident" {...EnvironmentColors}>
            Prepare to Trigger General Incident
          </NavButton>
          <div className="flex flex-row items-center gap-4 py-4">
            <div className="grow border-b-2 border-color-divider-line" />
            <div className="shrink-0 grow-0 font-medium text-xl">Or</div>
            <div className="grow border-b-2 border-color-divider-line" />
          </div>
          <h2 className="text-2xl font-light">Specific Application Incident</h2>
          <p>
            If you know the internal Terra application that's having trouble,
            you can see if it's available in the list here.
          </p>
          <p>
            If it is, you can trigger an incident against it specifically. Doing
            so can provide more information to the engineer or change who gets
            paged.
          </p>
          <p>
            Don't stress about choosing.{" "}
            <b className="font-semibold">
              If you're unsure, triggering a general incident above is always
              okay!
            </b>
          </p>
          <p>
            This option is especially helpful for apps that have been recently
            launched or aren't a core part of Terra, where there might be
            another team with their own on-call rotation who can respond best.
          </p>
          <NavButton to="./chart-releases" {...ChartReleaseColors}>
            View Applications with Specific Incident Channels
          </NavButton>
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ environment }} />
    </>
  );
}

export const useTriggerIncidentContext = useOutletContext<{
  environment: SerializeFrom<typeof loader>;
}>;
