import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";
import {
  EnvironmentsApi,
  PagerdutyIntegrationsApi,
} from "@sherlock-js-client/sherlock";
import { getPdAppIdFromEnv } from "~/components/logic/pagerduty-token";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { LinkPagerdutyPanel } from "../features/sherlock/pagerduty-integrations/link-pagerduty/link-pagerduty-panel";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentContext } from "./_layout.environments.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/link-pagerduty`}>
      Link PagerDuty
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Link PagerDuty` },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return Promise.all([
    new PagerdutyIntegrationsApi(SherlockConfiguration)
      .apiPagerdutyIntegrationsV3Get({}, handleIAP(request))
      .catch(errorResponseThrower),
    getPdAppIdFromEnv(),
  ]);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const environmentRequest: SherlockEnvironmentV3 = {
    ...formDataToObject(formData, false),
  };

  return new EnvironmentsApi(SherlockConfiguration)
    .apiEnvironmentsV3SelectorPatch(
      {
        selector: params.environmentName || "",
        environment: environmentRequest,
      },
      handleIAP(request),
    )
    .then(
      (environment) => redirect(`/environments/${environment.name}`),
      makeErrorResponseReturner(environmentRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [pagerdutyIntegrations, pdAppID] = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { environment } = useEnvironmentContext();

  return (
    <LinkPagerdutyPanel
      pagerdutyIntegrations={pagerdutyIntegrations}
      existingPagerdutyId={environment.pagerdutyIntegrationInfo?.pagerdutyID}
      errorInfo={errorInfo}
      pdAppID={pdAppID}
      dest={`/environments/${environment.name}/link-pagerduty`}
      {...EnvironmentColors}
    />
  );
}
