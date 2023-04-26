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
  ChangesetsApi,
  ChartReleasesApi,
  EnvironmentsApi,
  V2controllersChangesetPlanRequestEnvironmentEntry,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { EnumSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { SidebarSelectMultipleChartReleases } from "~/features/sherlock/chart-releases/set/sidebar-select-multiple-chart-releases";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { SidebarFilterControlledList } from "../components/panel-structures/sidebar-filter-controlled-list";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  isReturnedErrorInfo,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { chartReleaseSorter } from "../features/sherlock/chart-releases/list/chart-release-sorter";
import { ChangeEnvironmentVersionsSidebarModes } from "../features/sherlock/environments/change-versions/change-environment-versions-sidebar-modes";
import { environmentSorter } from "../features/sherlock/environments/list/environment-sorter";
import { ListEnvironmentButtonText } from "../features/sherlock/environments/list/list-environment-button-text";
import { matchEnvironment } from "../features/sherlock/environments/list/match-environment";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentContext } from "./_layout.environments.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/change-versions`}>
      Change Versions
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Change Versions` },
];

export async function loader({ request, params }: LoaderArgs) {
  const url = new URL(request.url);
  const preconfiguredOtherEnvironment = url.searchParams.get("from");
  return Promise.all([
    new EnvironmentsApi(SherlockConfiguration)
      .apiV2EnvironmentsGet({}, forwardIAP(request))
      .then(
        (environments) => environments.sort(environmentSorter),
        errorResponseThrower
      ),
    new ChartReleasesApi(SherlockConfiguration)
      .apiV2ChartReleasesGet(
        { environment: params.environmentName },
        forwardIAP(request)
      )
      .then(
        (chartReleases) => chartReleases.sort(chartReleaseSorter),
        errorResponseThrower
      ),
    preconfiguredOtherEnvironment,
  ]);
}

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const useExactVersionsFromOtherEnvironment = formData.get(
    "useExactVersionsFromOtherEnvironment"
  );
  const followVersionsFromOtherEnvironment = formData.get(
    "followVersionsFromOtherEnvironment"
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
    followVersionsFromOtherEnvironment:
      typeof followVersionsFromOtherEnvironment === "string" &&
      followVersionsFromOtherEnvironment.length > 0
        ? followVersionsFromOtherEnvironment
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
          : json({ formState: changesetRequest }),
      makeErrorResponseReturner(changesetRequest)
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [otherEnvironments, chartReleases, preconfiguredOtherEnvironment] =
    useLoaderData<typeof loader>();
  const preconfigured = Boolean(preconfiguredOtherEnvironment);
  const { environment } = useEnvironmentContext();
  const actionData = useActionData<typeof action>();
  const errorSummary =
    actionData && isReturnedErrorInfo(actionData)
      ? actionData.errorSummary
      : undefined;
  const formState = actionData?.formState;

  const [otherEnvironment, setOtherEnvironment] = useState(
    formState?.useExactVersionsFromOtherEnvironment ||
      preconfiguredOtherEnvironment ||
      ""
  );
  const [otherEnvironmentBehavior, setOtherEnvironmentBehavior] =
    useState("exact");
  const [includedCharts, setIncludedCharts] = useState<Map<string, boolean>>(
    new Map(
      chartReleases.map((chartRelease) => [
        chartRelease.chart || "",
        chartRelease.includedInBulkChangesets === undefined
          ? true
          : chartRelease.includedInBulkChangesets,
      ])
    )
  );

  const includedList = Array.from(includedCharts)
    .filter(([_, included]) => included)
    .map(([chart, _]) => chart);

  const [sidebar, setSidebar] = useState<ChangeEnvironmentVersionsSidebarModes>(
    "select included charts"
  );

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title="Now Changing Versions"
          submitText="Click to Refresh and Preview Changes"
          {...EnvironmentColors}
        >
          <label>
            <h2 className="font-light text-2xl">
              Use Versions From Another Environment
            </h2>
            <p className="mb-2">
              You can think of this functionality like an old-school monolith
              promotion.
            </p>
            <p className="mb-2">
              For every chart instance included in this "{environment.name}"{" "}
              environment, if there is an instance of that chart in the
              environment referenced here, it will use the versions of that
              other chart instance.
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
              value={otherEnvironment}
              onChange={(e) => setOtherEnvironment(e.currentTarget.value)}
              onFocus={() => setSidebar("select other environment")}
              placeholder="Search..."
            />
          </label>
          {otherEnvironment && (
            <>
              <div>
                <h2 className="font-light text-2xl">Choose Behavior</h2>
                <p>
                  Beehive will grab versions from {otherEnvironment}. Here you
                  can choose how those versions should be applied.
                </p>
                <EnumSelect
                  className="grid grid-cols-2 mt-2"
                  fieldValue={otherEnvironmentBehavior}
                  setFieldValue={(value) => setOtherEnvironmentBehavior(value)}
                  enums={[
                    ["Once", "exact"],
                    ["Follow", "follow"],
                  ]}
                  {...EnvironmentColors}
                />
              </div>
              <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col space-y-4">
                {otherEnvironmentBehavior === "exact" && (
                  <>
                    <p>
                      This will copy versions and pin this environment to them
                      exactly. Refreshing anything in this environment won't
                      change the versions, they'll stick until someone changes
                      them.
                    </p>
                    <input
                      type="hidden"
                      name="useExactVersionsFromOtherEnvironment"
                      value={otherEnvironment}
                    />
                  </>
                )}
                {otherEnvironmentBehavior === "follow" && (
                  <>
                    <p>
                      This will copy versions and remember where they came from.
                      Refreshing anything in this environment in the future will
                      check {otherEnvironment} and grab whatever versions it
                      has.
                    </p>
                    <p>
                      Note that refreshing generally isn't automatic: someone
                      would still have to go and press the calculate button, but
                      they wouldn't need to specify anything in particular.
                    </p>
                    <input
                      type="hidden"
                      name="followVersionsFromOtherEnvironment"
                      value={otherEnvironment}
                    />
                  </>
                )}
              </div>
            </>
          )}
          <p className="pt-8">
            When you click calculate below, our systems will{" "}
            {otherEnvironment
              ? "copy versions from the environment above and "
              : ""}
            refresh all the included charts in this environment. You can select
            which charts you'd like to be included. If a chart isn't checked in
            the list, it won't be affected at all.
          </p>
          {chartReleases.find(
            (chartRelease) => chartRelease.includedInBulkChangesets === false
          ) !== undefined && (
            <p>
              <b className="font-bold">
                The default selected charts to the right have been intentionally
                customized by folks using the "Adjust Monolith / Bulk Update
                Defaults" button to the left.
              </b>{" "}
              You can change the default selection if you'd like, but especially
              for live environments keep in mind that teams who independently
              release their apps may not want them to be deployed to production
              by monolith.
            </p>
          )}
          <ActionButton
            type="button"
            size="fill"
            isActive={sidebar === "select included charts"}
            onClick={(e) => {
              setSidebar("select included charts");
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
          {!errorSummary && formState && (
            <p className="font-medium">
              There were no version changes with what you just specified.
            </p>
          )}
          {errorSummary && <FormErrorDisplay {...errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel>
        {sidebar === "select other environment" && (
          <SidebarFilterControlledList
            title="Select Other Environment"
            entries={otherEnvironments}
            filterText={otherEnvironment}
            filter={matchEnvironment}
            handleListButtonClick={(entry) => {
              setOtherEnvironment(entry.name || "");
              setSidebar("select included charts");
            }}
            detectListButtonActive={(entry) => entry.name === otherEnvironment}
            listButtonTextFactory={(entry) => (
              <ListEnvironmentButtonText environment={entry} />
            )}
            {...EnvironmentColors}
          />
        )}
        {sidebar === "select included charts" && (
          <SidebarSelectMultipleChartReleases
            title="Select Charts to Include"
            chartReleases={chartReleases}
            chartMap={includedCharts}
            setChartMap={setIncludedCharts}
            includeAppVersions
          />
        )}
      </InsetPanel>
    </>
  );
}
