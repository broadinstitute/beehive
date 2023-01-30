import {
  ActionArgs,
  LoaderArgs,
  redirect,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import {
  ChartReleasesApi,
  PagerdutyIntegrationsApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { getPdAppIdFromEnv } from "~/components/logic/pagerduty-token";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { LinkPagerdutyPanel } from "../features/sherlock/pagerduty-integrations/link-pagerduty/link-pagerduty-panel";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentChartReleaseContext } from "./_layout.environments.$environmentName.chart-releases.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/link-pagerduty`}
    >
      Link PagerDuty
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Chart Instance - Link PagerDuty`,
  },
];

export async function loader({ request }: LoaderArgs) {
  return Promise.all([
    new PagerdutyIntegrationsApi(SherlockConfiguration)
      .apiV2PagerdutyIntegrationsGet({}, forwardIAP(request))
      .catch(errorResponseThrower),
    getPdAppIdFromEnv(),
  ]);
}

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const chartReleaseRequest: V2controllersChartRelease = {
    ...formDataToObject(formData, false),
  };

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorPatch(
      {
        selector: `${params.environmentName}/${params.chartName}`,
        chartRelease: chartReleaseRequest,
      },
      forwardIAP(request)
    )
    .then(
      () =>
        redirect(
          `/environments/${params.environmentName}/chart-releases/${params.chartName}`
        ),
      makeErrorResponseReturner(chartReleaseRequest)
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [pagerdutyIntegrations, pdAppID] = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { chartRelease } = useEnvironmentChartReleaseContext();

  return (
    <LinkPagerdutyPanel
      pagerdutyIntegrations={pagerdutyIntegrations}
      existingPagerdutyId={chartRelease.pagerdutyIntegrationInfo?.pagerdutyID}
      errorInfo={errorInfo}
      pdAppID={pdAppID}
      dest={`/environments/${chartRelease.environment}/chart-releases/${chartRelease.chart}/link-pagerduty`}
      {...ChartReleaseColors}
    />
  );
}
