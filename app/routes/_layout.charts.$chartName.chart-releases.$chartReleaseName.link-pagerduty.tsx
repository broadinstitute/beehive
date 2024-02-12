import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";
import {
  ChartReleasesApi,
  PagerdutyIntegrationsApi,
} from "@sherlock-js-client/sherlock";
import { getPdAppIdFromEnv } from "~/components/logic/pagerduty-token";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "~/errors/helpers/error-response-handlers";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { LinkPagerdutyPanel } from "~/features/sherlock/pagerduty-integrations/link-pagerduty/link-pagerduty-panel";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartChartReleaseContext } from "~/routes/_layout.charts.$chartName.chart-releases.$chartReleaseName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/link-pagerduty`}
    >
      Link PagerDuty
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Link PagerDuty`,
  },
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
  const chartReleaseRequest: SherlockChartReleaseV3 = {
    ...formDataToObject(formData, false),
  };

  return new ChartReleasesApi(SherlockConfiguration)
    .apiChartReleasesV3SelectorPatch(
      {
        selector: params.chartReleaseName || "",
        chartRelease: chartReleaseRequest,
      },
      handleIAP(request),
    )
    .then(
      () =>
        redirect(
          `/charts/${params.chartName}/chart-releases/${params.chartReleaseName}`,
        ),
      makeErrorResponseReturner(chartReleaseRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [pagerdutyIntegrations, pdAppID] = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { chartRelease } = useChartChartReleaseContext();

  return (
    <LinkPagerdutyPanel
      pagerdutyIntegrations={pagerdutyIntegrations}
      existingPagerdutyId={chartRelease.pagerdutyIntegrationInfo?.pagerdutyID}
      errorInfo={errorInfo}
      pdAppID={pdAppID}
      dest={`/charts/${chartRelease.chart}/chart-releases/${chartRelease.name}/link-pagerduty`}
      {...ChartReleaseColors}
    />
  );
}
