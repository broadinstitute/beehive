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
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useClusterChartReleaseContext } from "~/routes/_layout.clusters.$clusterName.($filterNamespace).chart-releases.$namespace.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}/change-versions`}
    >
      Change Versions
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance - Change Versions`,
  },
];

export function loader({ request, params }: LoaderArgs) {
  const url = new URL(request.url);
  const preconfiguredAppVersionExact = url.searchParams.get("app");
  const preconfiguredChartVersionExact = url.searchParams.get("chart");
  return Promise.all([
    new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesGet({ chart: params.chartName }, handleIAP(request))
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

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const changesetRequest: V2controllersChangesetPlanRequestChartReleaseEntry = {
    ...formDataToObject(formData, true),
    chartRelease: `${params.clusterName}/${params.namespace}/${params.chartName}`,
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
    .then((changesets) => {
      return changesets.length > 0
        ? redirect(
            `/review-changesets?${[
              ...changesets.map((c) => `changeset=${c.id}`),
              `return=${encodeURIComponent(
                `/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}`,
              )}`,
            ].join("&")}`,
          )
        : json({ formState: changesetRequest });
    }, makeErrorResponseReturner(changesetRequest));
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useClusterChartReleaseContext();
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
