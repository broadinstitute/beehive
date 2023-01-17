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
  ChangesetsApi,
  ChartReleasesApi,
  ChartVersionsApi,
  V2controllersAppVersion,
  V2controllersChangesetPlanRequestChartReleaseEntry,
  V2controllersChartRelease,
  V2controllersChartVersion,
} from "@sherlock-js-client/sherlock";
import { useMemo, useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { AppVersionColors } from "~/components/content/app-version/app-version-colors";
import { AppVersionPicker } from "~/components/content/app-version/app-version-picker";
import { ChartReleaseChangeVersionHelpCopy } from "~/components/content/chart-release/chart-release-change-version-help-copy";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ChartVersionColors } from "~/components/content/chart-version/chart-version-colors";
import { ChartVersionPicker } from "~/components/content/chart-version/chart-version-picker";
import ActionButton from "~/components/interactivity/action-button";
import { ListFilterInfo } from "~/components/interactivity/list-filter-info";
import { TextField } from "~/components/interactivity/text-field";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
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
import { getSession } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/change-versions`}
    >
      Change Versions
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName}/${params.chartName} - Chart Instance - Change Versions`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const preconfiguredAppVersionExact = url.searchParams.get("app");
  const preconfiguredChartVersionExact = url.searchParams.get("chart");
  const preconfiguredOtherEnvironment = url.searchParams.get("from");
  return Promise.all([
    new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesGet({ chart: params.chartName }, forwardIAP(request))
      .then(
        (chartReleases) =>
          Array.from(
            chartReleases.filter(
              (chartRelease) =>
                chartRelease.environment !== params.environmentName
            )
          ),
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
    preconfiguredAppVersionExact,
    preconfiguredChartVersionExact,
    preconfiguredOtherEnvironment,
  ]);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const changesetRequest: V2controllersChangesetPlanRequestChartReleaseEntry = {
    ...formDataToObject(formData, true),
    chartRelease: `${params.environmentName}/${params.chartName}`,
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
    .then(
      (changesets) =>
        changesets.length > 0
          ? redirect(
              `/review-changesets?${[
                ...changesets.map((c) => `changeset=${c.id}`),
                `return=${encodeURIComponent(
                  `/environments/${params.environmentName}/chart-releases/${params.chartName}`
                )}`,
              ].join("&")}`
            )
          : changesetRequest,
      makeErrorResponserReturner(changesetRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChangeVersionsRoute: React.FunctionComponent = () => {
  const [
    otherChartReleases,
    appVersions,
    chartVersions,
    preconfiguredAppVersionExact,
    preconfiguredChartVersionExact,
    preconfiguredOtherEnvironment,
  ] =
    useLoaderData<
      [
        Array<V2controllersChartRelease>,
        Array<V2controllersAppVersion>,
        Array<V2controllersChartVersion>,
        string | null,
        string | null,
        string | null
      ]
    >();
  const preconfiguredVersions = Boolean(
    preconfiguredAppVersionExact || preconfiguredChartVersionExact
  );
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
  const { chartRelease } = useOutletContext<{
    chartRelease: V2controllersChartRelease;
  }>();
  const actionData = useActionData<
    | ActionErrorInfo<V2controllersChangesetPlanRequestChartReleaseEntry>
    | V2controllersChangesetPlanRequestChartReleaseEntry
  >();
  const actionErrorInfo:
    | undefined
    | ActionErrorInfo<V2controllersChangesetPlanRequestChartReleaseEntry> =
    actionData != undefined && "message" in actionData ? actionData : undefined;
  const existingFormData:
    | undefined
    | V2controllersChangesetPlanRequestChartReleaseEntry =
    actionData != undefined && "message" in actionData
      ? actionData.faultyRequest
      : actionData;

  const [
    useExactVersionsFromOtherChartRelease,
    setUseExactVersionsFromOtherChartRelease,
  ] = useState(
    existingFormData?.useExactVersionsFromOtherChartRelease ||
      (preconfiguredOtherEnvironment
        ? `${preconfiguredOtherEnvironment}/${chartRelease.chart}`
        : "")
  );
  const [showOtherChartReleasePicker, setShowOtherChartReleasePicker] =
    useState(false);
  const [appVersionExact, setAppVersionExact] = useState(
    existingFormData?.toAppVersionExact ||
      preconfiguredAppVersionExact ||
      chartRelease.appVersionExact ||
      ""
  );
  const [showAppVersionExactPicker, setShowAppVersionExactPicker] =
    useState(false);
  const [appVersionFollowChartRelease, setAppVersionFollowChartRelease] =
    useState(
      existingFormData?.toAppVersionFollowChartRelease ||
        chartRelease.appVersionFollowChartRelease ||
        ""
    );
  const [
    showAppVersionFollowChartReleasePicker,
    setShowAppVersionFollowChartReleasePicker,
  ] = useState(false);
  const [appVersionBranch, setAppVersionBranch] = useState(
    existingFormData?.toAppVersionBranch || chartRelease.appVersionBranch || ""
  );
  const [showAppVersionBranchPicker, setShowAppVersionBranchPicker] =
    useState(false);
  const [chartVersionExact, setChartVersionExact] = useState(
    existingFormData?.toChartVersionExact ||
      preconfiguredChartVersionExact ||
      chartRelease.chartVersionExact ||
      ""
  );
  const [showChartVersionExactPicker, setShowChartVersionExactPicker] =
    useState(false);
  const [chartVersionFollowChartRelease, setChartVersionFollowChartRelease] =
    useState(
      existingFormData?.toChartVersionFollowChartRelease ||
        chartRelease.chartVersionFollowChartRelease ||
        ""
    );
  const [
    showChartVersionFollowChartReleasePicker,
    setShowChartVersionFollowChartReleasePicker,
  ] = useState(false);

  let sidebar: React.ReactElement<InteractiveListProps> | undefined;
  if (showOtherChartReleasePicker) {
    sidebar = (
      <InteractiveList title="Select Other Instance" {...ChartReleaseColors}>
        <ListFilterInfo filterText={useExactVersionsFromOtherChartRelease} />
        <MemoryFilteredList
          entries={otherChartReleases}
          filterText={useExactVersionsFromOtherChartRelease}
          filter={(chartRelease, filterText) =>
            chartRelease.name?.includes(filterText) ||
            chartRelease.environment?.includes(filterText) ||
            chartRelease.cluster?.includes(filterText) ||
            chartRelease.namespace?.includes(filterText)
          }
        >
          {(chartRelease, index) => (
            <ActionButton
              key={index}
              onClick={() => {
                setUseExactVersionsFromOtherChartRelease(
                  chartRelease.name || ""
                );
                setShowOtherChartReleasePicker(false);
              }}
              isActive={
                useExactVersionsFromOtherChartRelease === chartRelease.name
              }
              {...ChartReleaseColors}
            >
              {chartRelease.destinationType === "environment" ? (
                <h2 className="font-light">
                  Environment:{" "}
                  <span className="font-medium">
                    {chartRelease.environment}
                  </span>{" "}
                  / {chartRelease.chart}
                </h2>
              ) : (
                <h2 className="font-light">
                  Cluster:{" "}
                  <span className="font-medium">{`${chartRelease.cluster} / ${chartRelease.namespace}`}</span>{" "}
                  / {chartRelease.chart}
                </h2>
              )}
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
                {`${chartRelease.chart} app @ `}
                {<span className="font-medium">{appVersion.appVersion}</span>}
              </h2>
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  } else if (showAppVersionFollowChartReleasePicker) {
    sidebar = (
      <InteractiveList title="Select Other Instance" {...ChartReleaseColors}>
        <ListFilterInfo filterText={appVersionFollowChartRelease} />
        <MemoryFilteredList
          entries={otherChartReleases}
          filterText={appVersionFollowChartRelease}
          filter={(chartRelease, filterText) =>
            chartRelease.name?.includes(filterText) ||
            chartRelease.environment?.includes(filterText) ||
            chartRelease.cluster?.includes(filterText) ||
            chartRelease.namespace?.includes(filterText)
          }
        >
          {(chartRelease, index) => (
            <ActionButton
              key={index}
              onClick={() => {
                setAppVersionFollowChartRelease(chartRelease.name || "");
                setShowAppVersionFollowChartReleasePicker(false);
              }}
              isActive={appVersionFollowChartRelease === chartRelease.name}
              {...ChartReleaseColors}
            >
              {chartRelease.destinationType === "environment" ? (
                <h2 className="font-light">
                  Environment:{" "}
                  <span className="font-medium">
                    {chartRelease.environment}
                  </span>{" "}
                  / {chartRelease.chart}
                </h2>
              ) : (
                <h2 className="font-light">
                  Cluster:{" "}
                  <span className="font-medium">{`${chartRelease.cluster} / ${chartRelease.namespace}`}</span>{" "}
                  / {chartRelease.chart}
                </h2>
              )}
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
                {`${chartRelease.chart} branch: `}
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
                {`${chartRelease.chart} chart @ `}
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
  } else if (showChartVersionFollowChartReleasePicker) {
    sidebar = (
      <InteractiveList title="Select Other Instance" {...ChartReleaseColors}>
        <ListFilterInfo filterText={chartVersionFollowChartRelease} />
        <MemoryFilteredList
          entries={otherChartReleases}
          filterText={chartVersionFollowChartRelease}
          filter={(chartRelease, filterText) =>
            chartRelease.name?.includes(filterText) ||
            chartRelease.environment?.includes(filterText) ||
            chartRelease.cluster?.includes(filterText) ||
            chartRelease.namespace?.includes(filterText)
          }
        >
          {(chartRelease, index) => (
            <ActionButton
              key={index}
              onClick={() => {
                setChartVersionFollowChartRelease(chartRelease.name || "");
                setShowChartVersionFollowChartReleasePicker(false);
              }}
              isActive={chartVersionFollowChartRelease === chartRelease.name}
              {...ChartReleaseColors}
            >
              {chartRelease.destinationType === "environment" ? (
                <h2 className="font-light">
                  Environment:{" "}
                  <span className="font-medium">
                    {chartRelease.environment}
                  </span>{" "}
                  / {chartRelease.chart}
                </h2>
              ) : (
                <h2 className="font-light">
                  Cluster:{" "}
                  <span className="font-medium">{`${chartRelease.cluster} / ${chartRelease.namespace}`}</span>{" "}
                  / {chartRelease.chart}
                </h2>
              )}
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  }

  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title="Now Changing Versions"
          submitText="Click to Refresh and Preview Changes"
          {...ChartReleaseColors}
        >
          {preconfiguredVersions || (
            <label>
              <h2 className="font-light text-2xl">
                Use Exact Versions From Another Instance of This Chart
              </h2>
              <p>
                This is a shortcut to copy the current exact versions from
                another instance of {chartRelease.chart}. It won't start
                following the other instance's versions or copy other
                configuration—it is a one-time copy of the current versions.
              </p>
              {preconfiguredOtherEnvironment && (
                <p className="mt-2 font-medium">
                  Note that this field was preconfigured from the link you
                  followed.
                </p>
              )}
              <TextField
                name="useExactVersionsFromOtherChartRelease"
                value={useExactVersionsFromOtherChartRelease}
                onChange={(e) =>
                  setUseExactVersionsFromOtherChartRelease(
                    e.currentTarget.value
                  )
                }
                onFocus={() => {
                  setShowOtherChartReleasePicker(true);
                  setShowAppVersionExactPicker(false);
                  setShowAppVersionFollowChartReleasePicker(false);
                  setShowAppVersionBranchPicker(false);
                  setShowChartVersionExactPicker(false);
                  setShowChartVersionFollowChartReleasePicker(false);
                }}
                placeholder="Search..."
              />
            </label>
          )}
          {(!useExactVersionsFromOtherChartRelease && (
            <>
              {(preconfiguredVersions && (
                <p className="font-medium">
                  Here are the current versions, plus the extra preconfiguration
                  from the link you followed.
                </p>
              )) || (
                <>
                  <div className="flex flex-row items-center gap-4 py-4">
                    <div className="grow border-b-2 border-color-divider-line"></div>
                    <div className="shrink-0 grow-0 font-medium text-xl">
                      Or
                    </div>
                    <div className="grow border-b-2 border-color-divider-line"></div>
                  </div>
                  <p>
                    Here are the current versions. You can change them if you
                    like, or just go ahead and click the button at the bottom to
                    refresh and recalculate any "branch" or "latest" versions.
                  </p>
                </>
              )}

              <AppVersionPicker
                isTargetingChangeset
                defaultAppVersionResolver={
                  existingFormData?.toAppVersionResolver ||
                  (preconfiguredAppVersionExact && "exact") ||
                  chartRelease.appVersionResolver ||
                  (chartRelease.chartInfo?.appImageGitRepo ? "branch" : "none")
                }
                appVersionExact={appVersionExact}
                setAppVersionExact={setAppVersionExact}
                setShowAppVersionExactPicker={setShowAppVersionExactPicker}
                appVersionFollowChartRelease={appVersionFollowChartRelease}
                setAppVersionFollowChartRelease={
                  setAppVersionFollowChartRelease
                }
                setShowAppVersionFollowChartReleasePicker={
                  setShowAppVersionFollowChartReleasePicker
                }
                defaultAppVersionCommit={
                  existingFormData?.toAppVersionCommit ||
                  chartRelease.appVersionCommit ||
                  ""
                }
                appVersionBranch={appVersionBranch}
                setAppVersionBranch={setAppVersionBranch}
                setShowAppVersionBranchPicker={setShowAppVersionBranchPicker}
                showFirecloudDevelopRefField={
                  chartRelease.chartInfo?.legacyConfigsEnabled
                }
                defaultFirecloudDevelopRef={
                  existingFormData?.toFirecloudDevelopRef ||
                  chartRelease.firecloudDevelopRef ||
                  chartRelease.environmentInfo?.defaultFirecloudDevelopRef ||
                  "dev"
                }
                hideOtherPickers={() => {
                  setShowOtherChartReleasePicker(false);
                  setShowChartVersionExactPicker(false);
                  setShowChartVersionFollowChartReleasePicker(false);
                }}
              />
              <ChartVersionPicker
                isTargetingChangeset
                defaultChartVersionResolver={
                  existingFormData?.toChartVersionResolver ||
                  (preconfiguredChartVersionExact && "exact") ||
                  chartRelease.chartVersionResolver ||
                  "lates"
                }
                chartVersionExact={chartVersionExact}
                setChartVersionExact={setChartVersionExact}
                setShowChartVersionExactPicker={setShowChartVersionExactPicker}
                chartVersionFollowChartRelease={chartVersionFollowChartRelease}
                setChartVersionFollowChartRelease={
                  setChartVersionFollowChartRelease
                }
                setShowChartVersionFollowChartRelease={
                  setShowChartVersionFollowChartReleasePicker
                }
                defaultHelmfileRef={
                  existingFormData?.toHelmfileRef ||
                  chartRelease.helmfileRef ||
                  "HEAD"
                }
                hideOtherPickers={() => {
                  setShowAppVersionExactPicker(false);
                  setShowAppVersionBranchPicker(false);
                  setShowAppVersionFollowChartReleasePicker(false);
                  setShowOtherChartReleasePicker(false);
                }}
              />
            </>
          )) || (
            <p>
              Clear out the field above if you'd like to set versions yourself
              instead.
            </p>
          )}
          {!actionErrorInfo && existingFormData && (
            <p className="font-medium">
              There were no version changes with what you specified.
            </p>
          )}
          {actionErrorInfo && displayErrorInfo(actionErrorInfo)}
        </ActionBox>
      </OutsetPanel>
      {(sidebar && (
        <Branch>
          <InsetPanel>{sidebar}</InsetPanel>
        </Branch>
      )) || (
        <Leaf>
          <InsetPanel>
            <FillerText>
              <ChartReleaseChangeVersionHelpCopy
                chartInstanceName={chartRelease.name}
              />
            </FillerText>
          </InsetPanel>
        </Leaf>
      )}
    </Branch>
  );
};

export default ChangeVersionsRoute;
