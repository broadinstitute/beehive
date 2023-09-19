import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { defer, redirect } from "@remix-run/node";
import {
  Await,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { ChangesetsApi, ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { BeehiveIcon } from "~/components/assets/beehive-icon";
import { ActionButton } from "~/components/interactivity/action-button";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { ListControls } from "~/components/interactivity/list-controls";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { BigActionBox } from "~/components/panel-structures/big-action-box";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { runGha } from "~/features/github/run-gha";
import { ChangesetEntry } from "~/features/sherlock/changesets/list/changeset-entry";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import * as google from "~/helpers/google.server";
import { panelSizeToInnerClassName } from "~/helpers/panel-size";
import { safeRedirectPath } from "~/helpers/validate";
import { commitSession } from "~/session.server";
import { ProdFlag } from "../components/layout/prod-flag";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { getValidSession } from "../helpers/get-valid-session.server";

export const handle = {
  breadcrumb: () => (
    <span className="pointer-events-none">Review Version Changes</span>
  ),
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Review Version Changes",
  },
];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const changesetIDs = url.searchParams.getAll("changeset");
  const changesetsApi = new ChangesetsApi(SherlockConfiguration);
  const chartReleasesApi = new ChartReleasesApi(SherlockConfiguration);
  const changesets = await Promise.all(
    changesetIDs.map(async (id) => {
      const changeset = await changesetsApi
        .apiV2ChangesetsSelectorGet({ selector: id }, handleIAP(request))
        .catch(errorResponseThrower);
      // We need two levels deep, not one like Sherlock gives us by default,
      // so we fill the chartReleaseInfo ourselves with a followup request.
      changeset.chartReleaseInfo = await chartReleasesApi
        .apiV2ChartReleasesSelectorGet(
          {
            selector: changeset.chartRelease || "",
          },
          handleIAP(request),
        )
        .catch(errorResponseThrower);
      return changeset;
    }),
  );

  // If any of these changes affect prod and haven't been applied, check the release protection calendar
  let protectionEventsPromise: Promise<google.calendar_v3.Schema$Event[]> =
    // By default, don't load anything. We still need to set this to a promise to make Remix's typescript happy.
    new Promise((resolve) => resolve([]));
  if (
    changesets.find(
      (c) =>
        (c.chartReleaseInfo?.environment === "prod" ||
          c.chartReleaseInfo?.cluster === "terra-prod") &&
        !c.appliedAt &&
        !c.supersededAt,
    ) &&
    process.env.RELEASE_PROTECTION_CALENDAR_ID
  ) {
    // We don't care about events that ended in the past
    const endTimeLowerBound = new Date(Date.now());
    // We don't care about events that won't have even started an hour from now
    const startTimeUpperBound = new Date(Date.now());
    startTimeUpperBound.setHours(startTimeUpperBound.getHours() + 1);
    protectionEventsPromise = google
      .calendar({
        version: "v3",
        auth: new google.auth.GoogleAuth({
          // That this scope is required means that local ADC will probably fail unless you specifically do
          // `gcloud auth application-default login --scopes=https://www.googleapis.com/auth/calendar`
          scopes: ["https://www.googleapis.com/auth/calendar"],
        }),
      })
      .events.list({
        calendarId: process.env.RELEASE_PROTECTION_CALENDAR_ID,
        timeMin: endTimeLowerBound.toISOString(),
        timeMax: startTimeUpperBound.toISOString(),
        singleEvents: true, // Flatten recurring events, treat them just as individual events
        orderBy: "startTime", // Ascending order (earliest-starting events first)
        maxResults: 3, // Get just the first few events -- we can't just get the one because we want to ignore "transparent" ("show me as available") events
      })
      .then(
        (response) =>
          response.data.items?.filter(
            (event) => event.transparency !== "transparent",
          ) || [],
        (reason) => {
          console.error(
            `failed to query workbench protection calendar: ${reason}`,
          );
          throw new Error(
            `failed to query workbench protection calendar: ${reason}`,
          );
        },
      );
  }
  return defer({
    changesets,
    protectionCalendarID: process.env.RELEASE_PROTECTION_CALENDAR_ID,
    protectionEventsPromise,
  });
}

export async function action({ request }: ActionArgs) {
  const session = await getValidSession(request);

  const formData = await request.formData();
  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsApplyPost(
      {
        applyRequest: formData
          .getAll("changeset")
          .filter((value): value is string => typeof value === "string"),
      },
      handleIAP(request),
    )
    .then(async () => {
      if (
        formData.get("action") !== "none" &&
        formData
          .getAll("sync")
          .filter((value): value is string => typeof value === "string")
          .length > 0
      ) {
        await runGha(
          session,
          {
            workflow_id: ".github/workflows/sync-release.yaml",
            inputs: {
              // Get this from hidden fields on the form so that we can filter out what is and isn't a template easily
              "chart-release-names": formData
                .getAll("sync")
                .filter((value): value is string => typeof value === "string")
                .join(","),
              "changeset-ids": formData
                .getAll("sync-changeset")
                .filter((value): value is string => typeof value === "string")
                .join(","),
            },
          },
          "sync your changes",
        );
      }
      return redirect(
        safeRedirectPath(formData.get("return")?.toString() || "/"),
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        },
      );
    }, makeErrorResponseReturner());
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { changesets, protectionCalendarID, protectionEventsPromise } =
    useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  let returnURL = "";
  ((value) => {
    if (value) {
      returnURL = decodeURIComponent(value);
    }
  })(searchParams.get("return"));
  if (!returnURL) {
    returnURL = "/";
  }
  const returnColors = returnURL.includes("chart-releases/")
    ? ChartReleaseColors
    : returnURL.includes("clusters")
    ? ClusterColors
    : returnURL.includes("environments")
    ? EnvironmentColors
    : ChartReleaseColors;

  const [filterText, setFilterText] = useState("");
  const [actionToRun, setActionToRun] = useState("sync");

  const changesetLookup = useMemo(
    () =>
      new Map(
        changesets.map((changeset) => [
          changeset.chartRelease || "",
          changeset,
        ]),
      ),
    [changesets],
  );
  const [includedChangesets, setIncludedChangesets] = useState<
    Map<string, boolean>
  >(
    new Map(
      changesets
        .filter(
          (changeset): changeset is { chartRelease: string } =>
            !changeset.appliedAt &&
            !changeset.supersededAt &&
            changeset.chartRelease !== undefined,
        )
        .map((changeset) => [changeset.chartRelease, true]),
    ),
  );

  const includedCount = Array.from(includedChangesets).filter(
    ([_, included]) => included,
  ).length;

  let includesProd = false;
  let includesTemplate = false;
  for (const changeset of changesets) {
    if (
      changeset.chartRelease &&
      includedChangesets.get(changeset.chartRelease)
    ) {
      if (
        changeset.chartReleaseInfo?.environment === "prod" ||
        changeset.chartReleaseInfo?.cluster === "terra-prod"
      ) {
        includesProd = true;
      }
      if (
        changeset.chartReleaseInfo?.environmentInfo?.lifecycle === "template"
      ) {
        includesTemplate = true;
      }
    }
  }

  const [showProdModal, setShowProdModal] = useState(includesProd);

  if (showProdModal) {
    return (
      <div
        data-theme-prod="true"
        className="absolute w-full h-full bg-color-far-bg flex flex-col items-center justify-center text-color-header-text"
      >
        <h2 className="text-6xl font-extralight">Hey, these changes affect</h2>
        <h1 className="text-[12rem] leading-none font-semibold">Production</h1>
        <h3 className="text-3xl font-extralight">
          The usual review screen is coming up next
        </h3>
        <br />
        <ActionButton
          type="button"
          beforeBorderClassName="before:border-color-neutral-hard-border"
          textAlignment="text-center"
          onClick={() => setShowProdModal(false)}
        >
          Click to Continue
        </ActionButton>
      </div>
    );
  }

  return (
    <ProdFlag prod={includesProd}>
      <OutsetPanel>
        <BigActionBox
          title="Review Version Changes"
          leadingContent={
            protectionCalendarID && (
              <Suspense
                fallback={
                  includesProd ? (
                    <div
                      className={`${panelSizeToInnerClassName(
                        "fill",
                      )} rounded-2xl border-4 border-dashed border-color-beehive-logo flex flex-row gap-4 p-8 text-color-body-text`}
                    >
                      <BeehiveIcon loading className="shrink-0 h-12 w-12" />
                      <p>
                        Loading{" "}
                        <a
                          href={`https://calendar.google.com/calendar/u/0/embed?src=${protectionCalendarID}`}
                          className="underline decoration-color-link-underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          release protection calendar ↗
                        </a>{" "}
                        events...
                      </p>
                    </div>
                  ) : null
                }
              >
                <Await
                  resolve={protectionEventsPromise}
                  errorElement={
                    <div
                      className={`${panelSizeToInnerClassName(
                        "fill",
                      )} rounded-2xl border-4 border-dashed bg-color-error-bg border-color-error-border flex flex-row gap-4 p-8 text-color-body-text`}
                    >
                      <AlertCircle className="shrink-0 h-12 w-12 stroke-color-status-red" />
                      <p>
                        There was an error fetching events from the{" "}
                        <a
                          href={`https://calendar.google.com/calendar/u/0/embed?src=${protectionCalendarID}`}
                          className="underline decoration-color-link-underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          release protection calendar ↗
                        </a>
                        .
                      </p>
                    </div>
                  }
                >
                  {(calendarEvents) =>
                    calendarEvents.length > 0 ? (
                      <div
                        className={`${panelSizeToInnerClassName(
                          "fill",
                        )} rounded-2xl border-4 border-dashed border-color-status-red flex flex-col space-y-4 p-8 text-color-body-text`}
                      >
                        <h3 className="text-5xl font-medium text-color-header-text">
                          <AlertCircle className="shrink-0 stroke-color-status-red inline-block w-12 h-12 align-bottom mr-1" />{" "}
                          Release Protection Event
                        </h3>
                        <p>
                          The{" "}
                          <a
                            href={`https://calendar.google.com/calendar/u/0/embed?src=${protectionCalendarID}`}
                            className="underline decoration-color-link-underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            release protection calendar ↗
                          </a>{" "}
                          has{" "}
                          {calendarEvents.length > 1
                            ? "some events"
                            : "an event"}{" "}
                          that would potentially conflict with this release.
                        </p>
                        {calendarEvents.map((event) => (
                          <p key={event.id}>
                            <a
                              href={event.htmlLink || undefined}
                              className="underline decoration-color-link-underline font-semibold"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {event.summary} ↗
                            </a>{" "}
                            starting at{" "}
                            <PrettyPrintTime time={event.start?.dateTime} /> and{" "}
                            ending at{" "}
                            <PrettyPrintTime time={event.end?.dateTime} />
                          </p>
                        ))}
                      </div>
                    ) : includesProd ? (
                      <div
                        className={`${panelSizeToInnerClassName(
                          "fill",
                        )} rounded-2xl border-4 border-dashed border-color-status-green flex flex-row gap-4 p-8 text-color-body-text`}
                      >
                        <CheckCircle className="shrink-0 h-12 w-12 stroke-color-status-green" />
                        <p>
                          The{" "}
                          <a
                            href={`https://calendar.google.com/calendar/u/0/embed?src=${protectionCalendarID}`}
                            className="underline decoration-color-link-underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            release protection calendar ↗
                          </a>{" "}
                          doesn't have any events that conflict with this
                          release, you're good to go.
                        </p>
                      </div>
                    ) : null
                  }
                </Await>
              </Suspense>
            )
          }
          returnPath={returnURL}
          returnText={
            changesets.some((c) => !c.appliedAt)
              ? "Go Back Without Applying"
              : "Go Home"
          }
          submitText={`Apply ${includedCount} Change${
            includedCount == 1 ? "" : "s"
          }`}
          hideButton={includedCount == 0}
          {...returnColors}
        >
          {changesets.some((c) => !c.appliedAt) ? (
            <>
              <p>
                Beehive has planned out these version changes, but they're not
                applied yet. Click the "
                <b className="font-semibold">{`Apply ${includedCount} Change${
                  includedCount == 1 ? "" : "s"
                }`}</b>
                " button below to apply these versions.
              </p>
              {filterText && (
                <p>
                  Note that this button will apply <i>all</i> the below changes,
                  not just the ones visible with your "{filterText}" filter.
                </p>
              )}
              {changesets.length > 1 && (
                <div className="flex flex-col space-y-1">
                  You can click the checkboxes to choose which changes to apply.
                  <ul>
                    {Array.from(includedChangesets).map(([name, included]) => (
                      <li key={name}>
                        <label className="inline-block cursor-pointer">
                          <input
                            type="checkbox"
                            checked={included}
                            onChange={() => {
                              setIncludedChangesets(
                                (previous) =>
                                  new Map([
                                    ...previous,
                                    [name, !(previous.get(name) || false)],
                                  ]),
                              );
                            }}
                            className="align-middle mr-3 cursor-pointer"
                          />
                          <span className="align-middle">{name}</span>
                        </label>
                        {included && (
                          <input
                            type="hidden"
                            name="changeset"
                            value={changesetLookup.get(name)?.id}
                          />
                        )}
                        {included &&
                          changesetLookup.get(name)?.chartReleaseInfo
                            ?.environmentInfo?.lifecycle !== "template" && (
                            <>
                              {/* 
                          These two inputs are basically passed verbatim to the GitHub Action that will sync 
                          or refresh changes. We're indeed potentially passing the changeset ID again, but 
                          it helps the Remix action know what to do. The 'changeset' list from above are the 
                          changesets to apply, while 'sync-changeset' is a similar list but lacking templates
                          so it makes sense to be passed to the sync GHA.
                          */}
                              <input type="hidden" name="sync" value={name} />
                              <input
                                type="hidden"
                                name="sync-changeset"
                                value={changesetLookup.get(name)?.id}
                              />
                            </>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {changesets.length == 1 && (
                <>
                  <input
                    type="hidden"
                    name="changeset"
                    value={changesets.at(0)?.id}
                  />
                  {changesets.at(0)?.chartReleaseInfo?.environmentInfo
                    ?.lifecycle === "template" || (
                    <>
                      {/*
                  Same as the above comment here, just in a different form because we're in a different
                  (single change) case where the HTML is structured differently.
                  */}
                      <input
                        type="hidden"
                        name="sync"
                        value={changesets.at(0)?.chartRelease || ""}
                      />
                      <input
                        type="hidden"
                        name="sync-changeset"
                        value={changesets.at(0)?.id}
                      />
                    </>
                  )}
                </>
              )}
              <details>
                <summary className="cursor-pointer">
                  Click here if you'd like to set advanced or non-standard
                  deployment options.
                </summary>
                <EnumInputSelect
                  name="action"
                  className="grid grid-cols-2 mt-2"
                  fieldValue={actionToRun}
                  setFieldValue={setActionToRun}
                  enums={[
                    ["Run Deployment", "sync"],
                    ["Do Nothing", "none"],
                  ]}
                  {...returnColors}
                />
                <div className="mt-4 pl-6 border-l-2 border-color-divider-line flex gap-2 flex-col">
                  {actionToRun === "sync" && (
                    <>
                      <p className="font-semibold">
                        This option is the default.
                      </p>
                      <p>
                        A GitHub Action will be kicked off to deploy any
                        selected changes as soon as you apply them.
                      </p>
                      <p>This means it will hard-refresh and sync ArgoCD.</p>
                      <p>
                        When that GitHub Action completes, post-deploy hooks
                        (like Slack notifications) will run normally.
                      </p>
                    </>
                  )}
                  {actionToRun === "none" && (
                    <>
                      <p>
                        When you apply version changes, nothing will happen
                        afterwards.
                      </p>
                      <p>
                        Our platform will remember your changes, but they won't
                        be deployed until someone/something hard-refreshes and
                        syncs ArgoCD.
                      </p>
                      <p>
                        Since no automatic deployment action will be run,
                        post-deploy hooks (like Slack notifications) will not be
                        run.
                      </p>
                      <p className="font-semibold">
                        This option is not recommended unless you want to use
                        ArgoCD yourself to manually deploy changes.
                      </p>
                    </>
                  )}
                  {includesTemplate && (
                    <p>
                      At least one of the changes you're applying is to a
                      template, so no GitHub Action will be run for that
                      regardless of what option you select here.
                    </p>
                  )}
                </div>
              </details>
            </>
          ) : (
            <>
              <p>These changes have already been applied.</p>
              <p>
                You can click the buttons in each entry to jump to that resource
                in Beehive.
              </p>
            </>
          )}

          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </BigActionBox>
      </OutsetPanel>

      <InsetPanel size="two-thirds">
        <InteractiveList
          title={
            changesets.some((c) => !c.appliedAt)
              ? "Changes to Be Applied"
              : "Applied Changes"
          }
          size="two-thirds"
          {...ChartReleaseColors}
        >
          <ListControls
            filterText={filterText}
            setFilterText={setFilterText}
            size="fill"
            {...returnColors}
          />
          <MemoryFilteredList
            filterText={filterText}
            entries={changesets}
            filter={(changeset, filterText) =>
              changeset.chartReleaseInfo?.name?.includes(filterText) ||
              changeset.chartReleaseInfo?.chart?.includes(filterText) ||
              changeset.chartReleaseInfo?.environment?.includes(filterText) ||
              changeset.chartReleaseInfo?.cluster?.includes(filterText) ||
              changeset.chartReleaseInfo?.namespace?.includes(filterText) ||
              changeset.chartReleaseInfo?.appVersionExact?.includes(
                filterText,
              ) ||
              changeset.toAppVersionResolver?.includes(filterText) ||
              changeset.chartReleaseInfo?.chartVersionExact?.includes(
                filterText,
              ) ||
              changeset.toChartVersionResolver?.includes(filterText)
            }
          >
            {(changeset, index) => (
              <ChangesetEntry
                size="fill"
                changeset={changeset}
                key={index}
                includedCheckboxValue={
                  changesets.length > 1
                    ? includedChangesets.get(
                        changeset.chartRelease as string,
                      ) || false
                    : undefined
                }
                setIncludedCheckboxValue={(value: boolean) =>
                  setIncludedChangesets(
                    (previous) =>
                      new Map([
                        ...previous,
                        [changeset.chartRelease as string, value],
                      ]),
                  )
                }
                startMinimized={changesets.length > 1}
              />
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
    </ProdFlag>
  );
}
