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
import { ListControls } from "~/components/interactivity/list-controls";
import { DoubleInsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import {
  buildNotifications,
  GitHubActionsNotification,
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
      session.flash(
        sessionFields.flashNotifications,
        buildNotifications({
          type: "announcement",
          text: "Typically a GitHub Action would've just launched, but that isn't wired up for this dry-run",
        })
      );
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

  const changesetIdLookup = useMemo(
    () =>
      new Map(
        changesets
          .filter(
            (changeset): changeset is { chartRelease: string; id: number } =>
              changeset.chartRelease !== undefined && changeset.id !== undefined
          )
          .map(({ chartRelease, id }) => [chartRelease, id])
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

  return (
    <Branch>
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
          <p>
            Our systems will then kick off a GitHub Action to sync Argo (to pick
            up the any new versions) and run smoke tests (when the chart has
            them configured).
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
                        value={changesetIdLookup.get(name)}
                        className="align-middle mr-3"
                      />
                      <span className="align-middle">{name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {changesets.length == 1 && (
            <input
              type="hidden"
              name="changeset"
              value={changesets.at(0)?.id}
            />
          )}
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
                    key={index.toString()}
                    className={`h-fit w-[60vw] bg-white rounded-2xl shadow-md border-2 ${ChartReleaseColors.borderClassName} flex flex-col space-y-2 px-6 pb-5 pt-4`}
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
                      <h1 className="font-light text-4xl">
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
                      <h2 className="font-medium text-2xl border-b border-zinc-500 pb-1">
                        Before
                      </h2>
                      <h2 className="font-medium text-2xl border-b border-zinc-500 pb-1">
                        After
                      </h2>
                      {(changeset.fromAppVersionResolver === "none" &&
                        changeset.toAppVersionResolver === "none") || (
                        <>
                          <h2
                            className={`mt-1 row-span-2 font-light text-3xl ${
                              appVersionChanged ? "text-black" : "text-black/40"
                            }`}
                          >
                            {changeset.fromAppVersionResolver === "none"
                              ? "None"
                              : `${changeset.chartReleaseInfo?.chart} app @ ${changeset.fromAppVersionExact}`}
                          </h2>
                          <h2
                            className={`mt-1 font-light text-3xl ${
                              appVersionChanged ? "text-black" : "text-black/40"
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
                                        className="underline decoration-blue-500"
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
                                              className="underline decoration-blue-500"
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
                                ? "text-black"
                                : "text-black/40"
                            }
                          >
                            {`Specified `}
                            {changeset.fromAppVersionResolver === "exact" &&
                              `exact app version`}
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
                                ? "text-black"
                                : "text-black/40"
                            }
                          >
                            {`Specified `}
                            {changeset.toAppVersionResolver === "exact" &&
                              `exact app version`}
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
                                    ? "text-black"
                                    : "text-black/40"
                                }
                              >{`This app version is ${
                                changeset.fromAppVersionReference ? "" : " not"
                              } tracked by DevOps`}</p>
                              <p
                                className={
                                  appVersionInSherlockChanged
                                    ? "text-black"
                                    : "text-black/40"
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
                                ? "text-black"
                                : "text-black/40"
                            } border-b border-zinc-500 pb-2`}
                          >{`Legacy configuration from firecloud-develop's ${changeset.fromFirecloudDevelopRef?.substring(
                            0,
                            7
                          )}`}</p>
                          <p
                            className={`${
                              firecloudDevelopRefChanged
                                ? "text-black"
                                : "text-black/40"
                            } border-b border-zinc-500 pb-2`}
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
                                  className="underline decoration-blue-500"
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
                          chartVersionChanged ? "text-black" : "text-black/40"
                        }`}
                      >
                        {`${changeset.chartReleaseInfo?.chart} chart @ ${changeset.fromChartVersionExact}`}
                      </h2>
                      <h2
                        className={`mt-3 font-light text-3xl ${
                          chartVersionChanged ? "text-black" : "text-black/40"
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
                                className="underline decoration-blue-500"
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
                            ? "text-black"
                            : "text-black/40"
                        }
                      >
                        {`Specified ${changeset.fromChartVersionResolver} chart version`}
                      </p>
                      <p
                        className={
                          chartVersionResolverChanged
                            ? "text-black"
                            : "text-black/40"
                        }
                      >
                        {`Specified ${changeset.toChartVersionResolver} chart version`}
                      </p>
                      {(!changeset.fromChartVersionReference ||
                        !changeset.toChartVersionReference) && (
                        <>
                          <p
                            className={
                              chartVersionInSherlockChanged
                                ? "text-black"
                                : "text-black/40"
                            }
                          >{`This chart version is ${
                            changeset.fromChartVersionReference ? "" : " not"
                          } tracked by DevOps`}</p>
                          <p
                            className={
                              chartVersionInSherlockChanged
                                ? "text-black"
                                : "text-black/40"
                            }
                          >{`This chart version is ${
                            changeset.toChartVersionReference ? "" : " not"
                          } tracked by DevOps`}</p>
                        </>
                      )}
                      <p
                        className={`${
                          helmfileRefChanged ? "text-black" : "text-black/40"
                        } border-b border-zinc-500 pb-2`}
                      >{`Configuration from terra-helmfile's ${changeset.fromHelmfileRef?.substring(
                        0,
                        7
                      )}`}</p>
                      <p
                        className={`${
                          helmfileRefChanged ? "text-black" : "text-black/40"
                        } border-b border-zinc-500 pb-2`}
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
                              className="underline decoration-blue-500"
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
