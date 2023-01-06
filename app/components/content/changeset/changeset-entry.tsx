import { SerializeFrom } from "@remix-run/node";
import { V2controllersChangeset } from "@sherlock-js-client/sherlock";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { AppVersionLinkChip } from "../app-version/app-version-link-chip";
import { ChartReleaseColors } from "../chart-release/chart-release-colors";
import { ChartVersionLinkChip } from "../chart-version/chart-version-link-chip";
import { ChartLinkChip } from "../chart/chart-link-chip";
import {
  ClusterLinkChip,
  NamespaceLinkChip,
} from "../cluster/cluster-link-chip";
import { EnvironmentLinkChip } from "../environment/environment-link-chip";

export const ChangesetEntry: React.FunctionComponent<{
  changeset: V2controllersChangeset | SerializeFrom<V2controllersChangeset>;
  disableTitle?: boolean;
  fadeIfUnappliable?: boolean;
  includedCheckboxValue?: boolean;
  setIncludedCheckboxValue?: (value: boolean) => void;
}> = ({
  changeset,
  disableTitle = false,
  fadeIfUnappliable = true,
  includedCheckboxValue,
  setIncludedCheckboxValue,
}) => {
  const appVersionChanged =
    changeset.fromAppVersionExact !== changeset.toAppVersionExact;
  const appVersionResolverChanged =
    changeset.fromAppVersionResolver !== changeset.toAppVersionResolver ||
    (changeset.toAppVersionResolver === "follow" &&
      changeset.fromAppVersionFollowChartRelease !==
        changeset.toAppVersionFollowChartRelease) ||
    (changeset.toAppVersionResolver === "commit" &&
      changeset.fromAppVersionCommit !== changeset.toAppVersionCommit) ||
    (changeset.toAppVersionResolver === "branch" &&
      changeset.fromAppVersionBranch !== changeset.toAppVersionBranch);
  const appVersionInSherlockChanged =
    (changeset.fromAppVersionReference === undefined) !==
    (changeset.toAppVersionReference === undefined);
  const firecloudDevelopRefChanged =
    changeset.fromFirecloudDevelopRef !== changeset.toFirecloudDevelopRef;
  const chartVersionChanged =
    changeset.fromChartVersionExact !== changeset.toChartVersionExact;
  const chartVersionResolverChanged =
    changeset.fromChartVersionResolver !== changeset.toChartVersionResolver;
  const chartVersionInSherlockChanged =
    (changeset.fromChartVersionReference === undefined) !==
    (changeset.toChartVersionReference === undefined);
  const helmfileRefChanged =
    changeset.fromHelmfileRef !== changeset.toHelmfileRef;
  const appliable = !changeset.appliedAt && !changeset.supersededAt;
  return (
    <div
      data-theme-prod={
        changeset.chartReleaseInfo?.environment === "prod" ||
        changeset.chartReleaseInfo?.cluster === "terra-prod"
      }
      className={`h-fit w-[60vw] bg-color-near-bg rounded-2xl shadow-md border-2 ${ChartReleaseColors.borderClassName} flex flex-col space-y-2 px-6 pb-5 pt-4 text-color-body-text`}
    >
      {disableTitle || (
        <>
          <div className="flex flex-row space-x-4 pb-2">
            {appliable &&
              includedCheckboxValue != undefined &&
              setIncludedCheckboxValue != undefined &&
              !changeset.supersededAt &&
              !changeset.appliedAt && (
                <input
                  type="checkbox"
                  className="w-9"
                  title="Include in the changes to apply?"
                  checked={includedCheckboxValue}
                  onChange={() => {
                    setIncludedCheckboxValue(!includedCheckboxValue);
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
            {changeset.chartReleaseInfo?.chart && (
              <ChartLinkChip chart={changeset.chartReleaseInfo?.chart} />
            )}
            {changeset.chartReleaseInfo?.environment && (
              <EnvironmentLinkChip
                environment={changeset.chartReleaseInfo.environment}
              />
            )}
            {changeset.chartReleaseInfo?.cluster && (
              <ClusterLinkChip cluster={changeset.chartReleaseInfo?.cluster} />
            )}
            {changeset.chartReleaseInfo?.cluster &&
              changeset.chartReleaseInfo.namespace && (
                <NamespaceLinkChip
                  cluster={changeset.chartReleaseInfo?.cluster}
                  namespace={changeset.chartReleaseInfo.namespace}
                />
              )}
            {changeset.chartReleaseInfo?.chart &&
              changeset.chartReleaseInfo?.appVersionReference &&
              changeset.chartReleaseInfo?.appVersionExact && (
                <AppVersionLinkChip
                  chart={changeset.chartReleaseInfo.chart}
                  appVersionExact={changeset.chartReleaseInfo?.appVersionExact}
                />
              )}
            {changeset.chartReleaseInfo?.chart &&
              changeset.chartReleaseInfo?.chartVersionReference &&
              changeset.chartReleaseInfo?.chartVersionExact && (
                <ChartVersionLinkChip
                  chart={changeset.chartReleaseInfo.chart}
                  chartVersionExact={
                    changeset.chartReleaseInfo?.chartVersionExact
                  }
                />
              )}
          </div>
        </>
      )}
      <div
        className={`grid grid-cols-2 pt-2 gap-y-1 gap-x-4 ${
          !appliable && fadeIfUnappliable ? "opacity-50" : ""
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
                    )} to ${changeset.toAppVersionCommit.substring(0, 7)}`}
                    {changeset.chartReleaseInfo?.chartInfo?.appImageGitRepo && (
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
                  {changeset.newAppVersions?.map((appVersion, index) => (
                    <li key={index}>
                      <span className="font-semibold">
                        {appVersion.appVersion}
                      </span>
                      {(appVersion.description || appVersion.gitCommit) && (
                        <>
                          {": "}
                          {appVersion.description ? (
                            <PrettyPrintDescription
                              description={appVersion.description}
                              repo={
                                changeset.chartReleaseInfo?.chartInfo
                                  ?.appImageGitRepo
                              }
                            />
                          ) : (
                            <a
                              href={`https://github.com/${changeset.chartReleaseInfo?.chartInfo?.appImageGitRepo}/commit/${appVersion.gitCommit}`}
                              target="_blank"
                              className="underline decoration-color-link-underline"
                            >
                              {`${appVersion.gitCommit?.substring(0, 7)} ↗`}
                            </a>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {appVersionChanged &&
                changeset.newAppVersions?.at(0)?.parentAppVersion !==
                  changeset.fromAppVersionReference && (
                  <p>
                    A full version tree wasn't built; this list of changes might
                    be incomplete.
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
              {changeset.fromAppVersionResolver === "none" && `no app`}
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
              {changeset.toAppVersionResolver === "none" && `no app`}
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
        {changeset.chartReleaseInfo?.chartInfo?.legacyConfigsEnabled && (
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
                This chart isn't directly managed by DevOps, so our ability to
                show changes is limited.
              </p>
            ))}
          {chartVersionChanged && (
            <ul className="list-disc pl-5">
              {changeset.newChartVersions?.map((chartVersion, index) => (
                <li key={index}>
                  <span className="font-semibold">
                    {chartVersion.chartVersion}
                  </span>
                  {chartVersion.description && (
                    <>
                      {": "}
                      <PrettyPrintDescription
                        description={chartVersion.description}
                        repo={
                          changeset.chartReleaseInfo?.chartInfo?.chartRepo ===
                          "terra-helm"
                            ? "broadinstitute/terra-helmfile"
                            : undefined
                        }
                      />
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          {chartVersionChanged &&
            changeset.newChartVersions?.at(0)?.parentChartVersion !==
              changeset.fromChartVersionReference && (
              <p>
                A full version tree wasn't built; this list of changes might be
                incomplete.
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
              This change was applied at{" "}
              <PrettyPrintTime time={changeset.appliedAt} />
            </h1>
          )}
        </div>
      )}
    </div>
  );
};
