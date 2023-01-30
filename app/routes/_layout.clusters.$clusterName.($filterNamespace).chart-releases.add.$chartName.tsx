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
  AppVersionsApi,
  ChartReleasesApi,
  ChartsApi,
  ChartVersionsApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "~/errors/helpers/error-response-handlers";
import { AppVersionPicker } from "~/features/sherlock/app-versions/set/app-version-picker";
import { ChartReleaseCreatableClusterFields } from "~/features/sherlock/chart-releases/add/chart-release-creatable-cluster-fields";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ChartReleaseEditableFields } from "~/features/sherlock/chart-releases/edit/chart-release-editable-fields";
import { chartReleaseSorter } from "~/features/sherlock/chart-releases/list/chart-release-sorter";
import { ChartVersionPicker } from "~/features/sherlock/chart-versions/set/chart-version-picker";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useClusterChartReleasesAddContext } from "./_layout.clusters.$clusterName.($filterNamespace).chart-releases.add";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/add/${params.chartName}`}
    >
      {params.chartName}
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName} - Cluster - Add Chart - ${params.chartName}`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return Promise.all([
    new ChartsApi(SherlockConfiguration)
      .apiV2ChartsSelectorGet(
        { selector: params.chartName || "" },
        forwardIAP(request)
      )
      .catch(errorResponseThrower),
    new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesGet({ chart: params.chartName }, forwardIAP(request))
      .then(
        (chartReleases) =>
          chartReleases
            .filter(
              (chartRelease) =>
                chartRelease.cluster !== params.clusterName &&
                chartRelease.namespace !== params.namespace
            )
            .sort(chartReleaseSorter),
        errorResponseThrower
      ),
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
  ]);
}

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const chartReleaseRequest: V2controllersChartRelease = {
    ...formDataToObject(formData, true),
    chart: params.chartName,
    cluster: params.clusterName,
    port: ((port) =>
      typeof port === "string" && port !== "" ? parseInt(port) : undefined)(
      formData.get("port")
    ),
  };

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesPost(
      { chartRelease: chartReleaseRequest },
      forwardIAP(request)
    )
    .then(
      (chartRelease) =>
        redirect(
          `/clusters/${params.clusterName}/chart-releases/${chartRelease.namespace}/${chartRelease.chart}`
        ),
      makeErrorResponseReturner(chartReleaseRequest)
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [chart, otherChartReleases, appVersions, chartVersions] =
    useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { cluster, environments } = useClusterChartReleasesAddContext();

  const [sidebar, setSidebar] = useState<React.ReactNode>();

  return (
    <>
      <OutsetPanel {...ChartReleaseColors}>
        <ActionBox
          title={`Now Adding ${chart.name}`}
          submitText="Click to Add"
          {...ChartReleaseColors}
        >
          <ChartReleaseCreatableClusterFields
            environments={environments}
            setSidebar={setSidebar}
            initialName={
              errorInfo?.formState?.name || `${chart.name}-${cluster.name}`
            }
            initialNamespace={errorInfo?.formState?.namespace || ""}
            initialEnvironment={errorInfo?.formState?.environment || ""}
          />
          <p className="py-4">Fields below this point can be edited later.</p>
          <AppVersionPicker
            appVersions={appVersions}
            chartReleases={otherChartReleases}
            setSidebar={setSidebar}
            isTargetingChangeset={false}
            showFirecloudDevelopRef={chart.legacyConfigsEnabled}
            initialAppVersionResolver={
              errorInfo?.formState?.appVersionResolver ||
              (chart.appImageGitRepo ? "branch" : "none")
            }
            initialAppVersionExact={errorInfo?.formState?.appVersionExact || ""}
            initialAppVersionFollowChartRelease={
              errorInfo?.formState?.appVersionFollowChartRelease || ""
            }
            initialAppVersionCommit={
              errorInfo?.formState?.appVersionCommit || ""
            }
            initialAppVersionBranch={
              errorInfo?.formState?.appVersionBranch ||
              chart.appImageGitMainBranch ||
              ""
            }
            initialFirecloudDevelopRef={
              errorInfo?.formState?.firecloudDevelopRef || "dev"
            }
          />
          <br />
          <ChartVersionPicker
            chartVersions={chartVersions}
            chartReleases={otherChartReleases}
            setSidebar={setSidebar}
            isTargetingChangeset={false}
            initialChartVersionResolver={
              errorInfo?.formState?.chartVersionResolver || "latest"
            }
            initialChartVersionExact={
              errorInfo?.formState?.chartVersionExact || ""
            }
            initialChartVersionFollowChartRelease={
              errorInfo?.formState?.chartVersionFollowChartRelease || ""
            }
            initialHelmfileRef={errorInfo?.formState?.helmfileRef || "HEAD"}
          />
          <details className="pt-2">
            <summary className="cursor-pointer font-medium">
              Extra Fields
            </summary>
            <div className="pl-6 border-l-2 border-color-divider-line mt-4">
              <ChartReleaseEditableFields
                chartExposesEndpoint={chart.chartExposesEndpoint}
                defaultSubdomain={
                  errorInfo?.formState?.subdomain || chart.defaultSubdomain
                }
                defaultProtocol={
                  errorInfo?.formState?.protocol || chart.defaultProtocol
                }
                defaultPort={
                  errorInfo?.formState?.port?.toString() ||
                  chart.defaultPort?.toString()
                }
              />
            </div>
          </details>
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel largeScreenOnly={!sidebar}>{sidebar}</InsetPanel>
    </>
  );
}