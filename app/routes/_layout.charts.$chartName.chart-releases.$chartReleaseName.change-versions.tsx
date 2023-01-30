import {
  ActionArgs,
  json,
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
  AppVersionsApi,
  ChangesetsApi,
  ChartReleasesApi,
  ChartVersionsApi,
  V2controllersChangesetPlanRequestChartReleaseEntry,
} from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "~/errors/helpers/error-response-handlers";
import { ChangeChartReleaseVersionsPanel } from "~/features/sherlock/chart-releases/change-versions/change-chart-release-versions-panel";
import { chartReleaseSorter } from "~/features/sherlock/chart-releases/list/chart-release-sorter";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
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

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Change Versions`,
  },
];

export function loader({ request, params }: LoaderArgs) {
  const url = new URL(request.url);
  const preconfiguredAppVersionExact = url.searchParams.get("app");
  const preconfiguredChartVersionExact = url.searchParams.get("chart");
  return Promise.all([
    new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesGet({ chart: params.chartName }, forwardIAP(request))
      .then(
        (chartReleases) =>
          Array.from(
            chartReleases.filter(
              (chartRelease) =>
                chartRelease.cluster !== params.clusterName &&
                chartRelease.namespace !== params.namespace
            )
          ),
        errorResponseThrower
      )
      .then((chartReleases) => chartReleases.sort(chartReleaseSorter)),
    new AppVersionsApi(SherlockConfiguration)
      .apiV2AppVersionsGet(
        { chart: params.chartName, limit: 25 },
        forwardIAP(request)
      )
      .catch(errorResponseThrower),
    new ChartVersionsApi(SherlockConfiguration)
      .apiV2ChartVersionsGet(
        { chart: params.chartName, limit: 25 },
        forwardIAP(request)
      )
      .catch(errorResponseThrower),
    preconfiguredAppVersionExact,
    preconfiguredChartVersionExact,
  ]);
}

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const changesetRequest: V2controllersChangesetPlanRequestChartReleaseEntry = {
    ...formDataToObject(formData, true),
    chartRelease: params.chartReleaseName || "",
  };

  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsPlanPost(
      {
        changesetPlanRequest: {
          chartReleases: [changesetRequest],
        },
      },
      forwardIAP(request)
    )
    .then((changesets) => {
      return changesets.length > 0
        ? redirect(
            `/review-changesets?${[
              ...changesets.map((c) => `changeset=${c.id}`),
              `return=${encodeURIComponent(
                `/charts/${params.chartName}/chart-releases/${params.chartReleaseName}`
              )}`,
            ].join("&")}`
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
