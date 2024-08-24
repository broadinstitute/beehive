import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockChangesetV3PlanRequestChartReleaseEntry } from "@sherlock-js-client/sherlock";
import {
  AppVersionsApi,
  ChangesetsApi,
  ChartReleasesApi,
  ChartVersionsApi,
} from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "~/errors/helpers/error-response-handlers";
import { ChangeChartReleaseVersionsPanel } from "~/features/sherlock/chart-releases/change-versions/change-chart-release-versions-panel";
import { chartReleaseSorter } from "~/features/sherlock/chart-releases/list/chart-release-sorter";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartChartReleaseContext } from "~/routes/_layout.charts.$chartName.chart-releases.$chartReleaseName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/change-versions`}
    >
      Change Versions
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Change Versions`,
  },
];

export function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const preconfiguredAppVersionExact = url.searchParams.get("app");
  const preconfiguredChartVersionExact = url.searchParams.get("chart");
  return Promise.all([
    new ChartReleasesApi(SherlockConfiguration)
      .apiChartReleasesV3Get({ chart: params.chartName }, handleIAP(request))
      .then(
        (chartReleases) =>
          Array.from(
            chartReleases.filter(
              (chartRelease) =>
                chartRelease.cluster !== params.clusterName &&
                chartRelease.namespace !== params.namespace,
            ),
          ),
        errorResponseThrower,
      )
      .then((chartReleases) => chartReleases.sort(chartReleaseSorter)),
    new AppVersionsApi(SherlockConfiguration)
      .apiAppVersionsV3Get(
        { chart: params.chartName, limit: 25 },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
    new ChartVersionsApi(SherlockConfiguration)
      .apiChartVersionsV3Get(
        { chart: params.chartName, limit: 25 },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
    preconfiguredAppVersionExact,
    preconfiguredChartVersionExact,
  ]);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const changesetRequest: SherlockChangesetV3PlanRequestChartReleaseEntry = {
    ...formDataToObject(formData, true),
    chartRelease: params.chartReleaseName || "",
    toHelmfileRefEnabled:
      // "true" -> true, "false" -> false, empty or anything else -> act as if it wasn't set
      formData.get("toHelmfileRefEnabled") === "true"
        ? true
        : formData.get("toHelmfileRefEnabled") === "false"
          ? false
          : undefined,
  };

  return new ChangesetsApi(SherlockConfiguration)
    .apiChangesetsProceduresV3PlanPost(
      {
        changesetPlanRequest: {
          chartReleases: [changesetRequest],
        },
        verboseOutput: false,
      },
      handleIAP(request),
    )
    .then((changesets) => {
      return changesets.length > 0
        ? redirect(
            `/review-changesets?${[
              ...changesets.map((c) => `changeset=${c.id}`),
              `return=${encodeURIComponent(
                `/charts/${params.chartName}/chart-releases/${params.chartReleaseName}`,
              )}`,
            ].join("&")}`,
          )
        : json({ formState: changesetRequest });
    }, makeErrorResponseReturner(changesetRequest));
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useChartChartReleaseContext();
  const [
    otherChartReleases,
    appVersions,
    chartVersions,
    preconfiguredAppVersionExact,
    preconfiguredChartVersionExact,
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
      actionData={actionData}
    />
  );
}
