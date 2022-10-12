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
  ChangesetsApi,
  ChartReleasesApi,
  EnvironmentsApi,
  V2controllersChangesetPlanRequestEnvironmentEntry,
  V2controllersChartRelease,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import ActionButton from "~/components/interactivity/action-button";
import { ListControls } from "~/components/interactivity/list-controls";
import { ListFilterInfo } from "~/components/interactivity/list-filter-info";
import { TextField } from "~/components/interactivity/text-field";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerTextProps } from "~/components/panel-structures/filler-text";
import {
  InteractiveList,
  InteractiveListProps,
} from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseThrower,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/change-versions`}>
      Change Versions
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName} - Environment - Change Versions`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const preconfiguredOtherEnvironment = url.searchParams.get("from");
  return Promise.all([
    new EnvironmentsApi(SherlockConfiguration)
      .apiV2EnvironmentsGet({}, forwardIAP(request))
      .then(
        (environments) =>
          Array.from(
            environments.filter(
              (environment) => environment.name !== params.environmentName
            )
          ),
        errorResponseThrower
      ),
    new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesGet(
        { environment: params.environmentName },
        forwardIAP(request)
      )
      .catch(errorResponseThrower),
    preconfiguredOtherEnvironment,
  ]);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const useExactVersionsFromOtherEnvironment = formData.get(
    "useExactVersionsFromOtherEnvironment"
  );
  const changesetRequest: V2controllersChangesetPlanRequestEnvironmentEntry = {
    environment: params.environmentName,
    includeCharts: formData
      .getAll("includeChart")
      .filter((value): value is string => typeof value === "string"),
    useExactVersionsFromOtherEnvironment:
      typeof useExactVersionsFromOtherEnvironment === "string" &&
      useExactVersionsFromOtherEnvironment.length > 0
        ? useExactVersionsFromOtherEnvironment
        : undefined,
  };

  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsPlanPost(
      {
        changesetPlanRequest: {
          environments: [changesetRequest],
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
                  `/environments/${params.environmentName}/chart-releases`
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
  const [otherEnvironments, chartReleases, preconfiguredOtherEnvironment] =
    useLoaderData<
      [
        Array<V2controllersEnvironment>,
        Array<V2controllersChartRelease>,
        string | null
      ]
    >();
  const preconfigured = Boolean(preconfiguredOtherEnvironment);
  const { environment } = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const actionData = useActionData<
    | ActionErrorInfo<V2controllersChangesetPlanRequestEnvironmentEntry>
    | V2controllersChangesetPlanRequestEnvironmentEntry
  >();
  const actionErrorInfo:
    | undefined
    | ActionErrorInfo<V2controllersChangesetPlanRequestEnvironmentEntry> =
    actionData != undefined && "message" in actionData ? actionData : undefined;
  const existingFormData:
    | undefined
    | V2controllersChangesetPlanRequestEnvironmentEntry =
    actionData != undefined && "message" in actionData
      ? actionData.faultyRequest
      : actionData;

  const [
    useExactVersionsFromOtherEnvironment,
    setUseExactVersionsFromOtherEnvironment,
  ] = useState(
    existingFormData?.useExactVersionsFromOtherEnvironment ||
      preconfiguredOtherEnvironment ||
      ""
  );
  const [showOtherEnvironmentPicker, setshowOtherEnvironmentPicker] =
    useState(false);
  const [includedCharts, setIncludedCharts] = useState<Map<string, boolean>>(
    new Map(
      chartReleases
        .filter(
          (chartRelease): chartRelease is { chart: string } =>
            chartRelease.chart !== undefined
        )
        .map((chartRelease) => [chartRelease.chart, true])
    )
  );
  const [chartFilterText, setChartFilterText] = useState("");

  const includedList = Array.from(includedCharts)
    .filter(([_, included]) => included)
    .map(([chart, _]) => chart);

  let sidebar: React.ReactElement<InteractiveListProps>;
  if (showOtherEnvironmentPicker) {
    sidebar = (
      <InteractiveList title="Select Other Environment" {...EnvironmentColors}>
        <ListFilterInfo filterText={useExactVersionsFromOtherEnvironment} />
        <MemoryFilteredList
          entries={otherEnvironments}
          filterText={useExactVersionsFromOtherEnvironment}
          filter={(environment, filterText) =>
            environment.lifecycle?.includes(filterText) ||
            environment.base?.includes(filterText) ||
            environment.name?.includes(filterText)
          }
        >
          {(environment, index) => (
            <ActionButton
              key={index}
              onClick={() => {
                setUseExactVersionsFromOtherEnvironment(environment.name || "");
                setshowOtherEnvironmentPicker(false);
              }}
              isActive={
                useExactVersionsFromOtherEnvironment === environment.name
              }
              {...EnvironmentColors}
            >
              <h2 className="font-light">
                {environment.lifecycle !== "dynamic"
                  ? `${environment.lifecycle}: `
                  : ""}
                {environment.base} /{" "}
                <span className="font-medium">{environment.name}</span>
              </h2>
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  } else {
    sidebar = (
      <InteractiveList title="Select Charts to Include" {...ChartReleaseColors}>
        <ListControls
          setFilterText={setChartFilterText}
          {...ChartReleaseColors}
        />
        <MemoryFilteredList
          entries={chartReleases}
          filterText={chartFilterText}
          filter={(chartRelease, filterText) =>
            chartRelease.name?.includes(filterText) ||
            chartRelease.chart?.includes(filterText)
          }
        >
          {(chartRelease, index) => (
            <ActionButton
              key={index}
              isActive={includedCharts.get(chartRelease.chart || "")}
              onClick={() => {
                setIncludedCharts(
                  (previous) =>
                    new Map([
                      ...previous,
                      [
                        chartRelease.chart || "",
                        !previous.get(chartRelease.chart || ""),
                      ],
                    ])
                );
              }}
              {...ChartReleaseColors}
            >
              <h2 className="font-light">
                <span className="font-medium">{chartRelease.chart}</span>
                {chartRelease.appVersionResolver !== "none" &&
                  ` (app @ ${chartRelease.appVersionExact})`}
              </h2>
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
          submitText="Click to Calculate and Preview"
          {...EnvironmentColors}
        >
          <label>
            <h2 className="font-light text-2xl">
              Use Exact Versions From Another Environment
            </h2>
            <p className="mb-2">
              You can think of this functionality like an old-school monolith
              promotion.
            </p>
            <p className="mb-2">
              For every chart instance included in this "{environment.name}"{" "}
              environment, if there is an instance of that chart in the
              environment referenced here, use the exact versions of that other
              chart instance.
            </p>
            <p>
              For example, if you wanted your BEE to have the same versions as
              terra-prod, you could enter that here when you hit calculate below
              our systems will figure it out.
            </p>
            {preconfigured && (
              <p className="mt-2 font-medium">
                Note that this field was preconfigured from the link you
                followed.
              </p>
            )}
            <TextField
              name="useExactVersionsFromOtherEnvironment"
              value={useExactVersionsFromOtherEnvironment}
              onChange={(e) =>
                setUseExactVersionsFromOtherEnvironment(e.currentTarget.value)
              }
              onFocus={() => setshowOtherEnvironmentPicker(true)}
              placeholder="Search..."
            />
          </label>
          <p className="pt-8">
            When you click calculate below, our systems will{" "}
            {useExactVersionsFromOtherEnvironment
              ? "copy versions from the environment above and "
              : ""}
            refresh all the included charts in this environment. You can select
            which charts you'd like to be included. If a chart isn't highlighted
            in the list, it won't be affected at all.
          </p>
          <ActionButton
            sizeClassName=""
            isActive={!showOtherEnvironmentPicker}
            onClick={(e) => {
              setshowOtherEnvironmentPicker(false);
              e.preventDefault();
            }}
            activeOnHover
            {...ChartReleaseColors}
          >
            Select Charts to Include
          </ActionButton>
          {includedList.map((chartName) => (
            <input
              type="hidden"
              key={chartName}
              name="includeChart"
              value={chartName}
            />
          ))}
          {!actionErrorInfo && existingFormData && (
            <p className="font-medium">
              There were no version changes with what you specified.
            </p>
          )}
          {actionErrorInfo && displayErrorInfo(actionErrorInfo)}
        </ActionBox>
      </OutsetPanel>
      <Leaf>
        <InsetPanel>{sidebar}</InsetPanel>
      </Leaf>
    </Branch>
  );
};

export default ChangeVersionsRoute;
