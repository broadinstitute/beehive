import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockChangesetV3PlanRequestEnvironmentEntry } from "@sherlock-js-client/sherlock";
import {
  ChangesetsApi,
  ChartReleasesApi,
  EnvironmentsApi,
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
import { makeEnvironmentSorter } from "~/features/sherlock/environments/list/environment-sorter";
import { SidebarSelectEnvironment } from "~/features/sherlock/environments/set/sidebar-select-environment";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getUserEmail } from "~/helpers/get-user-email.server";
import { useSidebar } from "~/hooks/use-sidebar";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  isReturnedFormErrorInfo,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { chartReleaseSorter } from "../features/sherlock/chart-releases/list/chart-release-sorter";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentContext } from "./_layout.environments.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/change-versions`}>
      Change Versions
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Change Versions` },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const selfUserEmail = getUserEmail(request);
  const url = new URL(request.url);
  const preconfiguredOtherEnvironment = url.searchParams.get("from");
  return Promise.all([
    new EnvironmentsApi(SherlockConfiguration)
      .apiEnvironmentsV3Get({}, handleIAP(request))
      .then(
        (environments) =>
          environments.sort(makeEnvironmentSorter(null, selfUserEmail)),
        errorResponseThrower,
      ),
    new ChartReleasesApi(SherlockConfiguration)
      .apiChartReleasesV3Get(
        { environment: params.environmentName },
        handleIAP(request),
      )
      .then(
        (chartReleases) => chartReleases.sort(chartReleaseSorter),
        errorResponseThrower,
      ),
    preconfiguredOtherEnvironment,
  ]);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const useExactVersionsFromOtherEnvironment = formData.get(
    "useExactVersionsFromOtherEnvironment",
  );
  const followVersionsFromOtherEnvironment = formData.get(
    "followVersionsFromOtherEnvironment",
  );
  const changesetRequest: SherlockChangesetV3PlanRequestEnvironmentEntry = {
    environment: params.environmentName,
    includeCharts: formData
      .getAll("includeChart")
      .filter((value): value is string => typeof value === "string"),
    excludeCharts: formData
      .getAll("excludeChart")
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
    .apiChangesetsProceduresV3PlanPost(
      {
        changesetPlanRequest: {
          environments: [changesetRequest],
        },
        verboseOutput: false,
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
                  `/environments/${params.environmentName}/chart-releases`,
                )}`,
              ].join("&")}`,
            )
          : json({ formState: changesetRequest }),
      makeErrorResponseReturner(changesetRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [environments, chartReleases, preconfiguredOtherEnvironment] =
    useLoaderData<typeof loader>();
  const preconfigured = Boolean(preconfiguredOtherEnvironment);
  const { environment } = useEnvironmentContext();
  const actionData = useActionData<typeof action>();
  const errorSummary =
    actionData && isReturnedFormErrorInfo(actionData)
      ? actionData.errorSummary
      : undefined;
  const formState = actionData?.formState;

  const [otherEnvironment, setOtherEnvironment] = useState(
    formState?.useExactVersionsFromOtherEnvironment ||
      preconfiguredOtherEnvironment ||
      "",
  );
  const [otherEnvironmentBehavior, setOtherEnvironmentBehavior] =
    useState("exact");
  const defaultIncludedCharts = new Map(
    chartReleases.map((chartRelease) => [
      chartRelease.chart || "",
      chartRelease.includedInBulkChangesets === undefined
        ? true
        : chartRelease.includedInBulkChangesets,
    ]),
  );
  const [includedCharts, setIncludedCharts] = useState<Map<string, boolean>>(
    new Map(defaultIncludedCharts),
  );

  const otherEnvironments = environments.filter(
    (e) => e.name !== environment.name,
  );

  const {
    isSidebarPresent,
    setSidebar,
    setSidebarFilterText,
    SidebarComponent,
  } = useSidebar();

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title="Now Changing Versions"
          submitText="Click to Refresh and Preview Changes"
          {...EnvironmentColors}
        >
          <label>
            <h2 className="font-light text-2xl text-color-header-text">
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
              terra-prod, you could enter that here and when you hit calculate
              below our systems will figure it out.
            </p>
            {preconfigured && (
              <p className="mt-2 font-medium">
                Note that this field was preconfigured from the link you
                followed.
              </p>
            )}
            <TextField
              value={otherEnvironment}
              onChange={(e) => {
                setOtherEnvironment(e.currentTarget.value);
                setSidebarFilterText(e.currentTarget.value);
              }}
              onFocus={() =>
                setSidebar(({ filterText }) => (
                  <SidebarSelectEnvironment
                    environments={otherEnvironments}
                    fieldValue={filterText}
                    setFieldValue={(value) => {
                      setOtherEnvironment(value);
                      setSidebar();
                    }}
                  />
                ))
              }
              placeholder="Search..."
            />
          </label>
          {otherEnvironment && (
            <>
              <div>
                <h2 className="font-light text-2xl text-color-header-text">
                  Choose Behavior
                </h2>
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
            (chartRelease) => chartRelease.includedInBulkChangesets === false,
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
            isActive={!isSidebarPresent}
            onClick={(e) => {
              setSidebar();
              e.preventDefault();
            }}
            activeOnHover
            {...ChartReleaseColors}
          >
            Select Charts to Include
          </ActionButton>
          {Array.from(includedCharts).map(([chartName, included]) => (
            <input
              type="hidden"
              key={chartName}
              name={included ? "includeChart" : "excludeChart"}
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
        {isSidebarPresent ? (
          <SidebarComponent />
        ) : (
          <SidebarSelectMultipleChartReleases
            title="Select Charts to Include"
            chartReleases={chartReleases}
            chartMap={includedCharts}
            setChartMap={setIncludedCharts}
            includeAppVersions
            defaultChartMap={defaultIncludedCharts}
          />
        )}
      </InsetPanel>
    </>
  );
}
