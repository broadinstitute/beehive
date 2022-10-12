import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import {
  AppVersionsApi,
  ChartReleasesApi,
  ChartsApi,
  ChartVersionsApi,
  V2controllersAppVersion,
  V2controllersChart,
  V2controllersChartRelease,
  V2controllersChartVersion,
  V2controllersCluster,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { useMemo, useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { AppVersionColors } from "~/components/content/app-version/app-version-colors";
import { AppVersionPicker } from "~/components/content/app-version/app-version-picker";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ChartReleaseCreatableClusterFields } from "~/components/content/chart-release/chart-release-creatable-cluster-fields";
import { ChartReleaseEditableFields } from "~/components/content/chart-release/chart-release-editable-fields";
import { ChartVersionColors } from "~/components/content/chart-version/chart-version-colors";
import { ChartVersionPicker } from "~/components/content/chart-version/chart-version-picker";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import ActionButton from "~/components/interactivity/action-button";
import { ListFilterInfo } from "~/components/interactivity/list-filter-info";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { ActionBox } from "~/components/panel-structures/action-box";
import {
  FillerText,
  FillerTextProps,
} from "~/components/panel-structures/filler-text";
import {
  InteractiveList,
  InteractiveListProps,
} from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseThrower,
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/add/${params.chartName}`}
    >
      {params.chartName}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.clusterName} - Cluster - Add Chart - ${params.chartName}`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  return Promise.all([
    new ChartsApi(SherlockConfiguration)
      .apiV2ChartsSelectorGet(
        { selector: params.chartName || "" },
        forwardIAP(request)
      )
      .catch(errorResponseThrower),
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
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

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
      makeErrorResponserReturner(chartReleaseRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const NewRoute: React.FunctionComponent = () => {
  const [chart, appVersions, chartVersions] =
    useLoaderData<
      [
        V2controllersChart,
        Array<V2controllersAppVersion>,
        Array<V2controllersChartVersion>
      ]
    >();
  const branches = useMemo(
    () =>
      Array.from(
        new Set(
          appVersions
            .map((a) => a.gitBranch)
            .filter((value): value is string => typeof value === "string")
        )
      ),
    [appVersions]
  );
  const { cluster, environments } = useOutletContext<{
    cluster: V2controllersCluster;
    environments: Array<V2controllersEnvironment>;
  }>();
  const actionData =
    useActionData<ActionErrorInfo<V2controllersChartRelease>>();

  const [environment, setEnvironment] = useState(
    actionData?.faultyRequest.environment || ""
  );
  const [showEnvironmentPicker, setShowEnvironmentPicker] = useState(false);
  const [appVersionExact, setAppVersionExact] = useState(
    actionData?.faultyRequest.appVersionExact || ""
  );
  const [showAppVersionExactPicker, setShowAppVersionExactPicker] =
    useState(false);
  const [appVersionBranch, setAppVersionBranch] = useState(
    actionData?.faultyRequest.appVersionBranch ||
      chart.appImageGitMainBranch ||
      ""
  );
  const [showAppVersionBranchPicker, setShowAppVersionBranchPicker] =
    useState(false);
  const [chartVersionExact, setChartVersionExact] = useState(
    actionData?.faultyRequest.chartVersionExact || ""
  );
  const [showChartVersionExactPicker, setShowChartVersionExactPicker] =
    useState(false);

  let sidebar: React.ReactElement<InteractiveListProps | FillerTextProps>;
  if (showEnvironmentPicker) {
    sidebar = (
      <InteractiveList title="Select Environment" {...EnvironmentColors}>
        <ListFilterInfo filterText={environment} />
        <MemoryFilteredList
          entries={environments}
          filterText={environment}
          filter={(e, filterText) =>
            e.lifecycle?.includes(filterText) ||
            e.base?.includes(filterText) ||
            e.name?.includes(filterText)
          }
        >
          {(e, index) => (
            <ActionButton
              key={index.toString()}
              onClick={() => {
                setEnvironment(e.name || "");
                setShowEnvironmentPicker(false);
              }}
              isActive={e.name === environment}
              {...EnvironmentColors}
            >
              <h2 className="font-light">
                {e.lifecycle !== "dynamic" ? `${e.lifecycle}: ` : ""}
                {e.base} / <span className="font-medium">{e.name}</span>
              </h2>
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  } else if (showAppVersionExactPicker) {
    sidebar = (
      <InteractiveList title="Select App Version" {...AppVersionColors}>
        <ListFilterInfo filterText={appVersionExact} />
        <MemoryFilteredList
          entries={appVersions}
          filterText={appVersionExact}
          filter={(appVersion, filterText) =>
            appVersion.appVersion?.includes(filterText) ||
            appVersion.gitCommit?.includes(filterText) ||
            appVersion.gitBranch?.includes(filterText)
          }
        >
          {(appVersion, index) => (
            <ActionButton
              onClick={() => {
                setAppVersionExact(appVersion.appVersion || "");
                setShowAppVersionExactPicker(false);
              }}
              key={index.toString()}
              isActive={appVersionExact === appVersion.appVersion}
              {...AppVersionColors}
            >
              <h2 className="font-light">
                {`${chart.name} app @ `}
                {<span className="font-medium">{appVersion.appVersion}</span>}
              </h2>
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  } else if (showAppVersionBranchPicker) {
    sidebar = (
      <InteractiveList title="Recent Branches" {...AppVersionColors}>
        <MemoryFilteredList entries={branches}>
          {(branch, index) => (
            <ActionButton
              onClick={() => {
                setAppVersionBranch(branch);
                setShowAppVersionBranchPicker(false);
              }}
              key={index.toString()}
              {...AppVersionColors}
            >
              <h2 className="font-light">
                {`${chart.name} branch: `}
                <span className="font-medium">{branch}</span>
              </h2>
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  } else if (showChartVersionExactPicker) {
    sidebar = (
      <InteractiveList title="Select Chart Version" {...ChartVersionColors}>
        <ListFilterInfo filterText={chartVersionExact} />
        <MemoryFilteredList
          entries={chartVersions}
          filterText={chartVersionExact}
          filter={(chartVersion, filterText) =>
            chartVersion.chartVersion?.includes(filterText)
          }
        >
          {(chartVersion, index) => (
            <ActionButton
              onClick={() => {
                setChartVersionExact(chartVersion.chartVersion || "");
                setShowChartVersionExactPicker(false);
              }}
              key={index.toString()}
              isActive={chartVersionExact === chartVersion.chartVersion}
              {...ChartVersionColors}
            >
              <h2 className="font-light">
                {`${chart.name} chart @ `}
                {
                  <span className="font-medium">
                    {chartVersion.chartVersion}
                  </span>
                }
              </h2>
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  } else {
    sidebar = <FillerText></FillerText>;
  }

  return (
    <Branch>
      <OutsetPanel {...ChartReleaseColors}>
        <ActionBox
          title={`Now Adding ${chart.name}`}
          submitText="Click to Add"
          {...ChartReleaseColors}
        >
          <ChartReleaseCreatableClusterFields
            defaultName={`${chart.name}-${cluster.name}`}
            defaultNamespace={actionData?.faultyRequest.namespace || ""}
            environment={environment}
            setEnvironment={setEnvironment}
            setShowEnvironmentPicker={setShowEnvironmentPicker}
            hideOtherPickers={() => {
              setShowAppVersionExactPicker(false);
              setShowAppVersionBranchPicker(false);
              setShowChartVersionExactPicker(false);
            }}
          />
          <p className="py-4">Fields below this point can be edited later.</p>
          <AppVersionPicker
            defaultAppVersionResolver={
              actionData?.faultyRequest.appVersionResolver ||
              (chart.appImageGitRepo ? "branch" : "none")
            }
            appVersionExact={appVersionExact}
            setAppVersionExact={setAppVersionExact}
            setShowAppVersionExactPicker={setShowAppVersionExactPicker}
            defaultAppVersionCommit={
              actionData?.faultyRequest.appVersionCommit || ""
            }
            appVersionBranch={appVersionBranch}
            setAppVersionBranch={setAppVersionBranch}
            setShowAppVersionBranchPicker={setShowAppVersionBranchPicker}
            hideOtherPickers={() => {
              setShowChartVersionExactPicker(false);
              setShowEnvironmentPicker(false);
            }}
          />
          <br />
          <ChartVersionPicker
            defaultChartVersionResolver={
              actionData?.faultyRequest.chartVersionResolver || "latest"
            }
            chartVersionExact={chartVersionExact}
            setChartVersionExact={setChartVersionExact}
            setShowChartVersionExactPicker={setShowChartVersionExactPicker}
            defaultHelmfileRef={actionData?.faultyRequest.helmfileRef || "HEAD"}
            hideOtherPickers={() => {
              setShowAppVersionExactPicker(false);
              setShowAppVersionBranchPicker(false);
              setShowEnvironmentPicker(false);
            }}
          />
          <details className="pt-2">
            <summary className="cursor-pointer font-medium">
              Extra Fields
            </summary>
            <div className="pl-6 border-l-2 border-zinc-400 mt-4">
              {(chart.chartExposesEndpoint && (
                <ChartReleaseEditableFields
                  defaultSubdomain={
                    actionData?.faultyRequest.subdomain ||
                    chart.defaultSubdomain
                  }
                  defaultProtocol={
                    actionData?.faultyRequest.protocol || chart.defaultProtocol
                  }
                  defaultPort={
                    actionData?.faultyRequest.port?.toString() ||
                    chart.defaultPort?.toString()
                  }
                />
              )) || (
                <p>
                  This chart isn't flagged as having an endpoint so those
                  options aren't available here.
                </p>
              )}
            </div>
          </details>
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
      <Leaf>
        <InsetPanel>{sidebar}</InsetPanel>
      </Leaf>
    </Branch>
  );
};

export default NewRoute;
