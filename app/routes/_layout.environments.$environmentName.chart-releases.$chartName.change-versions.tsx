import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import {
  AppVersionsApi,
  ChangesetsApi,
  ChartReleasesApi,
  ChartVersionsApi,
  V2controllersChangesetPlanRequestChartReleaseEntry,
} from "@sherlock-js-client/sherlock";
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
import { ChangeChartReleaseVersionsPanel } from "../features/sherlock/chart-releases/change-versions/change-chart-release-versions-panel";
import { chartReleaseSorter } from "../features/sherlock/chart-releases/list/chart-release-sorter";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentChartReleaseContext } from "./_layout.environments.$environmentName.chart-releases.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/change-versions`}
    >
      Change Versions
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Chart Instance - Change Versions`,
  },
];

export function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const preconfiguredAppVersionExact = url.searchParams.get("app");
  const preconfiguredChartVersionExact = url.searchParams.get("chart");
  const preconfiguredOtherEnvironment = url.searchParams.get("from");
  return Promise.all([
    new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesGet({ chart: params.chartName }, handleIAP(request))
      .then(
        (chartReleases) =>
          Array.from(
            chartReleases
              .filter(
                (chartRelease) =>
                  chartRelease.environment !== params.environmentName,
              )
              .sort(chartReleaseSorter),
          ),
        errorResponseThrower,
      ),
    new AppVersionsApi(SherlockConfiguration)
      .apiV2AppVersionsGet(
        { chart: params.chartName, limit: 25 },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
    new ChartVersionsApi(SherlockConfiguration)
      .apiV2ChartVersionsGet(
        { chart: params.chartName, limit: 25 },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
    preconfiguredAppVersionExact,
    preconfiguredChartVersionExact,
    preconfiguredOtherEnvironment,
  ]);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const changesetRequest: V2controllersChangesetPlanRequestChartReleaseEntry = {
    ...formDataToObject(formData, true),
    chartRelease: `${params.environmentName}/${params.chartName}`,
    toHelmfileRefEnabled: formData.get("toHelmfileRefEnabled") === "true",
  };

  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsPlanPost(
      {
        changesetPlanRequest: {
          chartReleases: [changesetRequest],
        },
      },
      handleIAP(request),
    )
    .then(
      (changesets) =>
        changesets.length > 0
          ? redirect(
              `/review-changesets?${[
                ...changesets.map((c) => `changeset=${c.id}`),
                `return=${encodeURIComponent(
                  `/environments/${params.environmentName}/chart-releases/${params.chartName}`,
                )}`,
              ].join("&")}`,
            )
          : json({ formState: changesetRequest }),
      makeErrorResponseReturner(changesetRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useEnvironmentChartReleaseContext();
  const [
    otherChartReleases,
    appVersions,
    chartVersions,
    preconfiguredAppVersionExact,
    preconfiguredChartVersionExact,
    preconfiguredOtherEnvironment,
  ] = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <ChangeChartReleaseVersionsPanel
      chartRelease={chartRelease}
      otherChartReleases={otherChartReleases}
      appVersions={appVersions}
      chartVersions={chartVersions}
      preconfiguredAppVersionExact={preconfiguredAppVersionExact}
      preconfiguredChartVersionExact={preconfiguredChartVersionExact}
      preconfiguredOtherEnvironment={preconfiguredOtherEnvironment}
      actionData={actionData}
    />
  );
}
