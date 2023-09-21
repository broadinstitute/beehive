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
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { runGha } from "~/features/github/run-gha";
import { ChartReleaseCreatableEnvironmentFields } from "~/features/sherlock/chart-releases/add/chart-release-creatable-environment-fields";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ChartReleaseEditableFields } from "~/features/sherlock/chart-releases/edit/chart-release-editable-fields";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { useSidebar } from "~/hooks/use-sidebar";
import { commitSession } from "~/session.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { AppVersionPicker } from "../features/sherlock/app-versions/set/app-version-picker";
import { ChartVersionPicker } from "../features/sherlock/chart-versions/set/chart-version-picker";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentChartReleasesAddContext } from "./_layout.environments.$environmentName.chart-releases.add";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/add/${params.chartName}`}
    >
      {params.chartName}
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Environment - Add Chart - ${params.chartName}`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return Promise.all([
    new ChartsApi(SherlockConfiguration)
      .apiChartsV3SelectorGet(
        { selector: params.chartName || "" },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
    new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesGet({ chart: params.chartName }, handleIAP(request))
      .then(
        (chartReleases) =>
          Array.from(
            chartReleases.filter(
              (chartRelease) =>
                chartRelease.environment !== params.environmentName,
            ),
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
  ]);
}

export async function action({ request, params }: ActionArgs) {
  const session = await getValidSession(request);

  const formData = await request.formData();
  const chartReleaseRequest: V2controllersChartRelease = {
    ...formDataToObject(formData, true),
    chart: params.chartName,
    environment: params.environmentName,
    port: ((port) =>
      typeof port === "string" && port !== "" ? parseInt(port) : undefined)(
      formData.get("port"),
    ),
    helmfileRefEnabled: formData.get("helmfileRefEnabled") === "true",
  };

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesPost(
      { chartRelease: chartReleaseRequest },
      handleIAP(request),
    )
    .then(async (chartRelease) => {
      if (chartRelease.environmentInfo?.lifecycle === "dynamic") {
        await runGha(
          session,
          {
            workflow_id: ".github/workflows/bee-sync.yaml",
            inputs: {
              "bee-name": chartRelease.environmentInfo?.name || "",
            },
          },
          "sync your BEE",
        );
      }
      return redirect(
        `/environments/${params.environmentName}/chart-releases/${params.chartName}`,
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        },
      );
    }, makeErrorResponseReturner(chartReleaseRequest));
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [chart, otherChartReleases, appVersions, chartVersions] =
    useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { environment, clusters } = useEnvironmentChartReleasesAddContext();

  const {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    SidebarComponent,
  } = useSidebar();

  return (
    <>
      <OutsetPanel {...ChartReleaseColors}>
        <ActionBox
          title={`Now Adding ${chart.name}`}
          submitText="Click to Add"
          {...ChartReleaseColors}
        >
          <ChartReleaseCreatableEnvironmentFields
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
            clusters={clusters}
            requireCluster={environment.lifecycle !== "template"}
            initialName={
              errorInfo?.formState?.name || `${chart.name}-${environment.name}`
            }
            initialCluster={
              errorInfo?.formState?.cluster || environment.defaultCluster || ""
            }
          />
          <p className="py-4">Fields below this point can be edited later.</p>
          <AppVersionPicker
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
            appVersions={appVersions}
            chartReleases={otherChartReleases}
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
              errorInfo?.formState?.firecloudDevelopRef ||
              environment.defaultFirecloudDevelopRef ||
              "dev"
            }
          />
          <br />
          <ChartVersionPicker
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
            chartVersions={chartVersions}
            chartReleases={otherChartReleases}
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
            initialHelmfileRefEnabled={String(
              errorInfo?.formState?.helmfileRefEnabled || false,
            )}
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
                baseDomain={
                  environment.namePrefixesDomain
                    ? `${environment.name}.${environment.baseDomain}`
                    : environment.baseDomain
                }
              />
            </div>
          </details>
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel largeScreenOnly={!isSidebarPresent}>
        <SidebarComponent />
      </InsetPanel>
    </>
  );
}
