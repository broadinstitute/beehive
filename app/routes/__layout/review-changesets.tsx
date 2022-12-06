import { Octokit } from "@octokit/rest";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import {
  ChangesetsApi,
  ChartReleasesApi,
  V2controllersChangeset,
} from "@sherlock-js-client/sherlock";
import { useMemo, useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { AppVersionColors } from "~/components/content/app-version/app-version-colors";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ChartVersionColors } from "~/components/content/chart-version/chart-version-colors";
import { ChartColors } from "~/components/content/chart/chart-colors";
import { ClusterColors } from "~/components/content/cluster/cluster-colors";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import ActionButton from "~/components/interactivity/action-button";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { ListControls } from "~/components/interactivity/list-controls";
import { DoubleInsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import {
  buildNotifications,
  Notification,
} from "~/components/logic/notification";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { PrettyPrintVersionDescription } from "~/components/logic/pretty-print-version-description";
import { BigActionBox } from "~/components/panel-structures/big-action-box";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { DerivedErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseReturner,
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { safeRedirectPath } from "~/helpers/validate";
import { commitSession, getSession, sessionFields } from "~/session.server";

export const handle = {
  breadcrumb: () => (
    <span className="pointer-events-none">Review Version Changes</span>
  ),
};

export const meta: MetaFunction = () => ({
  title: "Review Version Changes",
});

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const changesetIDs = url.searchParams.getAll("changeset");
  const changesetsApi = new ChangesetsApi(SherlockConfiguration);
  const chartReleasesApi = new ChartReleasesApi(SherlockConfiguration);
  return Promise.all(
    changesetIDs.map(async (id) => {
      const changeset = await changesetsApi
        .apiV2ChangesetsSelectorGet({ selector: id }, forwardIAP(request))
        .catch(errorResponseThrower);
      // We need two levels deep, not one like Sherlock gives us by default,
      // so we fill the chartReleaseInfo ourselves with a followup request.
      changeset.chartReleaseInfo = await chartReleasesApi
        .apiV2ChartReleasesSelectorGet(
          {
            selector: changeset.chartRelease || "",
          },
          forwardIAP(request)
        )
        .catch(errorResponseThrower);
      return changeset;
    })
  );
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsApplyPost(
      {
        applyRequest: formData
          .getAll("changeset")
          .filter((value): value is string => typeof value === "string"),
      },
      forwardIAP(request)
    )
    .then(async () => {
      if (
        formData.get("action") !== "none" &&
        formData
          .getAll("sync")
          .filter((value): value is string => typeof value === "string")
          .length > 0
      ) {
        const payload = {
          owner: "broadinstitute",
          repo: "terra-github-workflows",
          workflow_id: ".github/workflows/sync-release.yaml",
          ref: "main",
          inputs: {
            // Get this from hidden fields on the form so that we can filter out what is and isn't a template easily
            "chart-release-names": formData
              .getAll("sync")
              .filter((value): value is string => typeof value === "string")
              .join(","),
            "refresh-only": (
              formData.get("action") === "refresh-only"
            ).toString(),
          },
        };
        console.log(
          `review-changesets workflow dispatch: ${JSON.stringify(payload)}`
        );
        const notification = await new Octokit({
          auth: session.get(sessionFields.githubAccessToken),
        }).actions
          .createWorkflowDispatch(payload)
          .then(
            (): Notification => ({
              type: "gha",
              text: "A GitHub Action has been started to sync your changes",
              url: "https://github.com/broadinstitute/terra-github-workflows/actions/workflows/sync-release.yaml",
            }),
            (rejected): Notification => ({
              type: "error",
              text: `There was a problem calling the GitHub Action to sync your changes: ${JSON.stringify(
                rejected
              )}`,
              error: true,
            })
          );
        session.flash(
          sessionFields.flashNotifications,
          buildNotifications(notification)
        );
      }
      return redirect(
        safeRedirectPath(formData.get("return")?.toString() || "/"),
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }, errorResponseReturner);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ReviewChangesetsRoute: React.FunctionComponent = () => {
  const changesets = useLoaderData<Array<V2controllersChangeset>>();
  const actionData = useActionData<DerivedErrorInfo>();

  const [searchParams] = useSearchParams();
  let returnURL: string = "";
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
    : EnvironmentColors;

  const [filterText, setFilterText] = useState("");
  const [actionToRun, setActionToRun] = useState("sync");

  const changesetLookup = useMemo(
    () =>
      new Map(
        changesets.map((changeset) => [changeset.chartRelease || "", changeset])
      ),
    [changesets]
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
            changeset.chartRelease !== undefined
        )
        .map((changeset) => [changeset.chartRelease, true])
    )
  );

  const includedCount = Array.from(includedChangesets).filter(
    ([_, included]) => included
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
    <Branch prod={includesProd}>
      <OutsetPanel>
        <BigActionBox
          title="Review Version Changes"
          returnPath={returnURL}
          returnText="Go Back Without Applying"
          submitText={`Apply ${includedCount} Change${
            includedCount == 1 ? "" : "s"
          }`}
          hideButton={includedCount == 0}
          {...returnColors}
        >
          <p>
            Applying these changes will immediately update our systems to
            reflect what the versions of{" "}
            {changesets.length > 0
              ? "this chart instance"
              : `these ${changesets.length} chart instances`}{" "}
            should be.
          </p>
          {filterText && (
            <p>
              Note that this button will apply <i>all</i> the below changes, not
              just the ones visible with your "{filterText}" filter.
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
                              ])
                          );
                        }}
                        name="changeset"
                        value={changesetLookup.get(name)?.id}
                        className="align-middle mr-3"
                      />
                      <span className="align-middle">{name}</span>
                    </label>
                    {changesetLookup.get(name)?.chartReleaseInfo
                      ?.environmentInfo?.lifecycle === "template" || (
                      <input type="hidden" name="sync" value={name} />
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
                <input
                  type="hidden"
                  name="sync"
                  value={changesets.at(0)?.chartRelease || ""}
                />
              )}
            </>
          )}
          <div>
            <h2 className="font-light text-2xl">Action to Run</h2>
            <EnumInputSelect
              name="action"
              className="grid grid-cols-3 mt-2"
              fieldValue={actionToRun}
              setFieldValue={setActionToRun}
              enums={[
                ["Refresh + Sync", "sync"],
                ["Refresh", "refresh"],
                ["None", "none"],
              ]}
              {...returnColors}
            />
            <div className="mt-4 pl-6 border-l-2 border-color-divider-line flex flex-col">
              {actionToRun === "sync" && (
                <p>
                  When applying, a GitHub Action will be kicked off to{" "}
                  <b className="font-semibold">refresh and sync</b> ArgoCD. This
                  will deploy the applied versions immediately.
                </p>
              )}
              {actionToRun === "refresh" && (
                <p>
                  When applying, a GitHub Action will be kicked off to{" "}
                  <b className="font-semibold">just refresh</b> ArgoCD. This
                  will not deployed the applied versions immediately, but it
                  will make ArgoCD say that the app is "out of sync." ArgoCD's
                  manual sync button would then deploy the new versions.
                </p>
              )}
              {actionToRun === "none" && (
                <p>
                  When applying, no GitHub Action will be kicked off. The
                  changes won't be deployed until someone or something
                  hard-refreshes and syncs ArgoCD.
                </p>
              )}
              {includesTemplate && (
                <p className="mt-4">
                  {
                    "At least one of the changes you're applying is to a template, so no GitHub Actions will be run for that regardless of what option you select here."
                  }
                </p>
              )}
            </div>
          </div>
          {actionData && displayErrorInfo(actionData)}
        </BigActionBox>
      </OutsetPanel>
      <Leaf>
        <DoubleInsetPanel>
          <InteractiveList
            title="Changes to Be Applied"
            doubleWidth
            {...ChartReleaseColors}
          >
            <ListControls
              filterText={filterText}
              setFilterText={setFilterText}
              doubleWidth
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
                `app:${changeset.chartReleaseInfo?.appVersionReference}`.includes(
                  filterText
                ) ||
                `chart:${changeset.chartReleaseInfo?.chartVersionReference}`.includes(
                  filterText
                )
              }
            >
              {(changeset, index) => {
                const appVersionChanged =
                  changeset.fromAppVersionExact !== changeset.toAppVersionExact;
                const appVersionResolverChanged =
                  changeset.fromAppVersionResolver !==
                    changeset.toAppVersionResolver ||
                  (changeset.toAppVersionResolver === "follow" &&
                    changeset.fromAppVersionFollowChartRelease !==
                      changeset.toAppVersionFollowChartRelease) ||
                  (changeset.toAppVersionResolver === "commit" &&
                    changeset.fromAppVersionCommit !==
                      changeset.toAppVersionCommit) ||
                  (changeset.toAppVersionResolver === "branch" &&
                    changeset.fromAppVersionBranch !==
                      changeset.toAppVersionBranch);
                const appVersionInSherlockChanged =
                  (changeset.fromAppVersionReference === undefined) !==
                  (changeset.toAppVersionReference === undefined);
                const firecloudDevelopRefChanged =
                  changeset.fromFirecloudDevelopRef !==
                  changeset.toFirecloudDevelopRef;
                const chartVersionChanged =
                  changeset.fromChartVersionExact !==
                  changeset.toChartVersionExact;
                const chartVersionResolverChanged =
                  changeset.fromChartVersionResolver !==
                  changeset.toChartVersionResolver;
                const chartVersionInSherlockChanged =
                  (changeset.fromChartVersionReference === undefined) !==
                  (changeset.toChartVersionReference === undefined);
                const helmfileRefChanged =
                  changeset.fromHelmfileRef !== changeset.toHelmfileRef;
                const appliable =
                  !changeset.appliedAt && !changeset.supersededAt;
                return (
                  <div
                    data-theme-prod={
                      changeset.chartReleaseInfo?.environment === "prod" ||
                      changeset.chartReleaseInfo?.cluster === "terra-prod"
                    }
                    key={index.toString()}
                    className={`h-fit w-[60vw] bg-color-near-bg rounded-2xl shadow-md border-2 ${ChartReleaseColors.borderClassName} flex flex-col space-y-2 px-6 pb-5 pt-4 text-color-body-text`}
                  >
                    <div className="flex flex-row space-x-4 pb-2">
                      {appliable &&
                        changesets.length > 1 &&
                        !changeset.supersededAt &&
                        !changeset.appliedAt && (
                          <input
                            type="checkbox"
                            className="w-9"
                            title="Include in the changes to apply?"
                            checked={
                              includedChangesets.get(
                                changeset.chartRelease as string
                              ) || false
                            }
                            onChange={() => {
                              setIncludedChangesets(
                                (previous) =>
                                  new Map([
                                    ...previous,
                                    [
                                      changeset.chartRelease as string,
                                      !(
                                        previous.get(
                                          changeset.chartRelease as string
                                        ) || false
                                      ),
                                    ],
                                  ])
                              );
                            }}
                          />
                        )}
                      <h1 className="font-light text-4xl text-color-header-text">
                        {changeset.chartReleaseInfo?.name}
                      </h1>
                    </div>
                    <div
                      className={`flex flex-row gap-3 max-h-full flex-wrap ${
                        appliable ? "" : "opacity-50 pointer-events-none"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setFilterText(changeset.chartReleaseInfo?.chart || "")
                        }
                        className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all  px-2 ${ChartColors.backgroundClassName} ${ChartColors.borderClassName} flex flex-row h-8 items-center`}
                      >
                        <h2 className="text-xl font-light">{`Chart: ${changeset.chartReleaseInfo?.chart}`}</h2>
                      </button>
                      {changeset.chartReleaseInfo?.environment && (
                        <button
                          onClick={() =>
                            setFilterText(
                              changeset.chartReleaseInfo?.environment || ""
                            )
                          }
                          className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all  px-2 ${EnvironmentColors.backgroundClassName} ${EnvironmentColors.borderClassName} flex flex-row h-8 items-center`}
                        >
                          <h2 className="text-xl font-light">{`Environment: ${changeset.chartReleaseInfo?.environment}`}</h2>
                        </button>
                      )}
                      {changeset.chartReleaseInfo?.cluster && (
                        <button
                          onClick={() =>
                            setFilterText(
                              changeset.chartReleaseInfo?.cluster || ""
                            )
                          }
                          className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all  px-2 ${ClusterColors.backgroundClassName} ${ClusterColors.borderClassName} flex flex-row h-8 items-center`}
                        >
                          <h2 className="text-xl font-light">{`Cluster: ${changeset.chartReleaseInfo?.cluster}`}</h2>
                        </button>
                      )}
                      {changeset.chartReleaseInfo?.namespace && (
                        <button
                          onClick={() =>
                            setFilterText(
                              changeset.chartReleaseInfo?.namespace || ""
                            )
                          }
                          className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all  px-2 ${ClusterColors.backgroundClassName} ${ClusterColors.borderClassName} flex flex-row h-8 items-center`}
                        >
                          <h2 className="text-xl font-light">{`Namespace: ${changeset.chartReleaseInfo?.namespace}`}</h2>
                        </button>
                      )}
                      {changeset.chartReleaseInfo?.appVersionReference && (
                        <button
                          onClick={() =>
                            setFilterText(
                              `app:${changeset.chartReleaseInfo?.appVersionReference}`
                            )
                          }
                          className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all  px-2 ${AppVersionColors.backgroundClassName} ${AppVersionColors.borderClassName} flex flex-row h-8 items-center`}
                        >
                          <h2 className="text-xl font-light">{`App Version: ${changeset.chartReleaseInfo?.appVersionExact}`}</h2>
                        </button>
                      )}
                      {changeset.chartReleaseInfo?.chartVersionReference && (
                        <button
                          onClick={() =>
                            setFilterText(
                              `chart:${changeset.chartReleaseInfo?.chartVersionReference}`
                            )
                          }
                          className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all  px-2 ${ChartVersionColors.backgroundClassName} ${ChartVersionColors.borderClassName} flex flex-row h-8 items-center`}
                        >
                          <h2 className="text-xl font-light">{`Chart Version: ${changeset.chartReleaseInfo?.chartVersionExact}`}</h2>
                        </button>
                      )}
                    </div>
                    <div
                      className={`grid grid-cols-2 pt-2 gap-y-1 gap-x-4 ${
                        appliable ? "" : "opacity-50"
                      }`}
                    >
                      <h2 className="font-medium text-2xl border-b border-color-divider-line pb-1">
                        Before
                      </h2>
                      <h2 className="font-medium text-2xl border-b border-color-divider-line pb-1">
                        After
                      </h2>
                      {(changeset.fromAppVersionResolver === "none" &&
                        changeset.toAppVersionResolver === "none") || (
                        <>
                          <h2
                            className={`mt-1 row-span-2 font-light text-3xl ${
                              appVersionChanged
                                ? "text-color-body-text"
                                : "text-color-body-text/40"
                            }`}
                          >
                            {changeset.fromAppVersionResolver === "none"
                              ? "None"
                              : `${changeset.chartReleaseInfo?.chart} app @ ${changeset.fromAppVersionExact}`}
                          </h2>
                          <h2
                            className={`mt-1 font-light text-3xl ${
                              appVersionChanged
                                ? "text-color-body-text"
                                : "text-color-body-text/40"
                            }`}
                          >
                            {changeset.toAppVersionResolver === "none"
                              ? "None"
                              : `${changeset.chartReleaseInfo?.chart} app @ ${changeset.toAppVersionExact}`}
                          </h2>
                          <div>
                            {appVersionChanged &&
                              changeset.fromAppVersionCommit &&
                              changeset.toAppVersionCommit && (
                                <p>
                                  {`From commit ${changeset.fromAppVersionCommit.substring(
                                    0,
                                    7
                                  )} to ${changeset.toAppVersionCommit.substring(
                                    0,
                                    7
                                  )}`}
                                  {changeset.chartReleaseInfo?.chartInfo
                                    ?.appImageGitRepo && (
                                    <>
                                      {" ("}
                                      <a
                                        href={`https://github.com/${changeset.chartReleaseInfo?.chartInfo?.appImageGitRepo}/compare/${changeset.fromAppVersionCommit}...${changeset.toAppVersionCommit}`}
                                        className="underline decoration-color-link-underline"
                                        target="_blank"
                                      >
                                        git diff ↗
                                      </a>
                                      {")"}
                                    </>
                                  )}
                                </p>
                              )}
                            {appVersionChanged && (
                              <ul className="list-disc pl-5">
                                {changeset.newAppVersions?.map(
                                  (appVersion, index) => (
                                    <li key={index}>
                                      <span className="font-semibold">
                                        {appVersion.appVersion}
                                      </span>
                                      {(appVersion.description ||
                                        appVersion.gitCommit) && (
                                        <>
                                          {": "}
                                          {appVersion.description ? (
                                            <PrettyPrintVersionDescription
                                              description={
                                                appVersion.description
                                              }
                                              repo={
                                                changeset.chartReleaseInfo
                                                  ?.chartInfo?.appImageGitRepo
                                              }
                                            />
                                          ) : (
                                            <a
                                              href={`https://github.com/${changeset.chartReleaseInfo?.chartInfo?.appImageGitRepo}/commit/${appVersion.gitCommit}`}
                                              target="_blank"
                                              className="underline decoration-color-link-underline"
                                            >
                                              {`${appVersion.gitCommit?.substring(
                                                0,
                                                7
                                              )} ↗`}
                                            </a>
                                          )}
                                        </>
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                            {appVersionChanged &&
                              changeset.newAppVersions?.at(0)
                                ?.parentAppVersion !==
                                changeset.fromAppVersionReference && (
                                <p>
                                  A full version tree wasn't built; this list of
                                  changes might be incomplete.
                                </p>
                              )}
                          </div>
                          <p
                            className={
                              appVersionResolverChanged
                                ? "text-color-body-text"
                                : "text-color-body-text/40"
                            }
                          >
                            {`Specified `}
                            {changeset.fromAppVersionResolver === "exact" &&
                              `exact app version`}
                            {changeset.fromAppVersionResolver === "follow" &&
                              `another instance - ${changeset.fromAppVersionFollowChartRelease}`}
                            {changeset.fromAppVersionResolver === "commit" &&
                              `app commit — ${changeset.fromAppVersionCommit}`}
                            {changeset.fromAppVersionResolver === "branch" &&
                              `app branch — ${changeset.fromAppVersionBranch}`}
                            {changeset.fromAppVersionResolver === "none" &&
                              `no app`}
                          </p>
                          <p
                            className={
                              appVersionResolverChanged
                                ? "text-color-body-text"
                                : "text-color-body-text/40"
                            }
                          >
                            {`Specified `}
                            {changeset.toAppVersionResolver === "exact" &&
                              `exact app version`}
                            {changeset.toAppVersionResolver === "follow" &&
                              `another instance for app version - ${changeset.toAppVersionFollowChartRelease}`}
                            {changeset.toAppVersionResolver === "commit" &&
                              `app commit — ${changeset.toAppVersionCommit}`}
                            {changeset.toAppVersionResolver === "branch" &&
                              `app branch — ${changeset.toAppVersionBranch}`}
                            {changeset.toAppVersionResolver === "none" &&
                              `no app`}
                          </p>
                          {(!changeset.fromAppVersionReference ||
                            !changeset.toAppVersionReference) && (
                            <>
                              <p
                                className={
                                  appVersionInSherlockChanged
                                    ? "text-color-body-text"
                                    : "text-color-body-text/40"
                                }
                              >{`This app version is ${
                                changeset.fromAppVersionReference ? "" : " not"
                              } tracked by DevOps`}</p>
                              <p
                                className={
                                  appVersionInSherlockChanged
                                    ? "text-color-body-text"
                                    : "text-color-body-text/40"
                                }
                              >{`This app version is ${
                                changeset.toAppVersionReference ? "" : " not"
                              } tracked by DevOps`}</p>
                            </>
                          )}
                        </>
                      )}
                      {changeset.chartReleaseInfo?.chartInfo
                        ?.legacyConfigsEnabled && (
                        <>
                          <p
                            className={`${
                              firecloudDevelopRefChanged
                                ? "text-color-body-text"
                                : "text-color-body-text/40"
                            } border-b border-color-divider-line pb-2`}
                          >{`Legacy configuration from firecloud-develop's ${changeset.fromFirecloudDevelopRef?.substring(
                            0,
                            7
                          )}`}</p>
                          <p
                            className={`${
                              firecloudDevelopRefChanged
                                ? "text-color-body-text"
                                : "text-color-body-text/40"
                            } border-b border-color-divider-line pb-2`}
                          >
                            {`Legacy configuration from firecloud-develop's ${changeset.toFirecloudDevelopRef?.substring(
                              0,
                              7
                            )}`}
                            {firecloudDevelopRefChanged && (
                              <>
                                {" ("}
                                <a
                                  href={`https://github.com/broadinstitute/firecloud-develop/compare/${changeset.fromFirecloudDevelopRef}...${changeset.toFirecloudDevelopRef}`}
                                  target="_blank"
                                  className="underline decoration-color-link-underline"
                                >
                                  git diff ↗
                                </a>
                                {")"}
                              </>
                            )}
                          </p>
                        </>
                      )}
                      <h2
                        className={`mt-3 row-span-2 font-light text-3xl ${
                          chartVersionChanged
                            ? "text-color-body-text"
                            : "text-color-body-text/40"
                        }`}
                      >
                        {`${changeset.chartReleaseInfo?.chart} chart @ ${changeset.fromChartVersionExact}`}
                      </h2>
                      <h2
                        className={`mt-3 font-light text-3xl ${
                          chartVersionChanged
                            ? "text-color-body-text"
                            : "text-color-body-text/40"
                        }`}
                      >
                        {`${changeset.chartReleaseInfo?.chart} chart @ ${changeset.toChartVersionExact}`}
                      </h2>
                      <div>
                        {chartVersionChanged &&
                          ((changeset.chartReleaseInfo?.chartInfo?.chartRepo ===
                            "terra-helm" && (
                            <p>
                              {`From tag ${changeset.fromChartVersionExact} to ${changeset.toChartVersionExact} (`}
                              <a
                                href={`https://github.com/broadinstitute/terra-helmfile/compare/charts/${changeset.chartReleaseInfo.chart}-${changeset.fromChartVersionExact}...charts/${changeset.chartReleaseInfo.chart}-${changeset.toChartVersionExact}`}
                                className="underline decoration-color-link-underline"
                                target="_blank"
                              >
                                git diff ↗
                              </a>
                              {")"}
                            </p>
                          )) || (
                            <p>
                              This chart isn't directly managed by DevOps, so
                              our ability to show changes is limited.
                            </p>
                          ))}
                        {chartVersionChanged && (
                          <ul className="list-disc pl-5">
                            {changeset.newChartVersions?.map(
                              (chartVersion, index) => (
                                <li key={index}>
                                  <span className="font-semibold">
                                    {chartVersion.chartVersion}
                                  </span>
                                  {chartVersion.description && (
                                    <>
                                      {": "}
                                      <PrettyPrintVersionDescription
                                        description={chartVersion.description}
                                        repo={
                                          changeset.chartReleaseInfo?.chartInfo
                                            ?.chartRepo === "terra-helm"
                                            ? "broadinstitute/terra-helmfile"
                                            : undefined
                                        }
                                      />
                                    </>
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                        {chartVersionChanged &&
                          changeset.newChartVersions?.at(0)
                            ?.parentChartVersion !==
                            changeset.fromChartVersionReference && (
                            <p>
                              A full version tree wasn't built; this list of
                              changes might be incomplete.
                            </p>
                          )}
                      </div>
                      <p
                        className={
                          chartVersionResolverChanged
                            ? "text-color-body-text"
                            : "text-color-body-text/40"
                        }
                      >
                        {changeset.fromChartVersionResolver === "follow"
                          ? `Specified another instance for chart version - ${changeset.fromChartVersionFollowChartRelease}`
                          : `Specified ${changeset.fromChartVersionResolver} chart version`}
                      </p>
                      <p
                        className={
                          chartVersionResolverChanged
                            ? "text-color-body-text"
                            : "text-color-body-text/40"
                        }
                      >
                        {changeset.toChartVersionResolver === "follow"
                          ? `Specified another instance for chart version - ${changeset.toChartVersionFollowChartRelease}`
                          : `Specified ${changeset.toChartVersionResolver} chart version`}
                      </p>
                      {(!changeset.fromChartVersionReference ||
                        !changeset.toChartVersionReference) && (
                        <>
                          <p
                            className={
                              chartVersionInSherlockChanged
                                ? "text-color-body-text"
                                : "text-color-body-text/40"
                            }
                          >{`This chart version is ${
                            changeset.fromChartVersionReference ? "" : " not"
                          } tracked by DevOps`}</p>
                          <p
                            className={
                              chartVersionInSherlockChanged
                                ? "text-color-body-text"
                                : "text-color-body-text/40"
                            }
                          >{`This chart version is ${
                            changeset.toChartVersionReference ? "" : " not"
                          } tracked by DevOps`}</p>
                        </>
                      )}
                      <p
                        className={`${
                          helmfileRefChanged
                            ? "text-color-body-text"
                            : "text-color-body-text/40"
                        } border-b border-color-divider-line pb-2`}
                      >{`Configuration from terra-helmfile's ${changeset.fromHelmfileRef?.substring(
                        0,
                        7
                      )}`}</p>
                      <p
                        className={`${
                          helmfileRefChanged
                            ? "text-color-body-text"
                            : "text-color-body-text/40"
                        } border-b border-color-divider-line pb-2`}
                      >
                        {`Configuration from terra-helmfile's ${changeset.toHelmfileRef?.substring(
                          0,
                          7
                        )}`}
                        {helmfileRefChanged && (
                          <>
                            {" ("}
                            <a
                              href={`https://github.com/broadinstitute/terra-helmfile/compare/${changeset.fromHelmfileRef}...${changeset.toHelmfileRef}`}
                              target="_blank"
                              className="underline decoration-color-link-underline"
                            >
                              git diff ↗
                            </a>
                            {")"}
                          </>
                        )}
                      </p>
                    </div>
                    {(changeset.supersededAt || changeset.appliedAt) && (
                      <div className="flex flex-col items-center pt-4">
                        {changeset.supersededAt && (
                          <h1 className="text-2xl font-light">
                            This proposed change is out of date as of{" "}
                            <PrettyPrintTime time={changeset.supersededAt} />
                          </h1>
                        )}
                        {changeset.appliedAt && (
                          <h1 className="text-2xl font-light">
                            This change was already applied at{" "}
                            <PrettyPrintTime time={changeset.appliedAt} />
                          </h1>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            </MemoryFilteredList>
          </InteractiveList>
        </DoubleInsetPanel>
      </Leaf>
    </Branch>
  );
};

export default ReviewChangesetsRoute;
