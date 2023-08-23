import type { SerializeFrom } from "@remix-run/node";
import type { V2controllersAppVersion } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { ChartLinkChip } from "../../charts/chart-link-chip";
import { CiRunResourceStatusWidget } from "../../ci/view/ci-run-resource-status-button";
import { MutateControls } from "../../mutate-controls";
import { AppVersionColors } from "../app-version-colors";

export interface AppVersionDetailsProps {
  appVersion: V2controllersAppVersion | SerializeFrom<V2controllersAppVersion>;
  initialCiRuns?: React.ComponentProps<
    typeof CiRunResourceStatusWidget
  >["initialCiRuns"];
  toEdit?: string;
  toTimeline?: string;
}

export const AppVersionDetails: React.FunctionComponent<
  AppVersionDetailsProps
> = ({ appVersion, initialCiRuns, toEdit, toTimeline }) => (
  <div className="flex flex-col space-y-10">
    <div className="flex flex-row gap-3 flex-wrap">
      {appVersion.chart && <ChartLinkChip chart={appVersion.chart} />}
    </div>
    <CiRunResourceStatusWidget
      ciIdentifier={
        appVersion.ciIdentifier?.id || `app-version/${appVersion.id}`
      }
      initialCiRuns={initialCiRuns}
    />
    {appVersion.gitCommit && appVersion.gitBranch && (
      <p>
        This App Version was built from commit{" "}
        <a
          href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}/commit/${appVersion.gitCommit}`}
          className="font-mono decoration-color-link-underline underline"
        >
          {appVersion.gitCommit?.substring(0, 7)}
        </a>
        , on the{" "}
        <a
          href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}/tree/${appVersion.gitBranch}`}
          className="font-mono decoration-color-link-underline underline"
        >
          {appVersion.gitBranch}
        </a>{" "}
        branch of{" "}
        <a
          href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}`}
          className=" decoration-color-link-underline underline"
        >
          {appVersion.chartInfo?.appImageGitRepo}
        </a>
        .
      </p>
    )}
    <p>
      Description:{" "}
      {appVersion.description ? (
        <PrettyPrintDescription
          description={appVersion.description}
          repo={appVersion.chartInfo?.appImageGitRepo}
        />
      ) : (
        "None"
      )}
    </p>
    {toTimeline && (
      <NavButton to={toTimeline} {...AppVersionColors}>
        Deployment Timeline
      </NavButton>
    )}
    {appVersion.parentAppVersion &&
      appVersion.parentAppVersionInfo &&
      appVersion.parentAppVersionInfo.hasOwnProperty("appVersion") && (
        <div className="flex flex-col space-y-2">
          <p>
            Sherlock has{" "}
            <span className="font-mono">{appVersion.parentAppVersion}</span>{" "}
            recorded as this version's "parent."
          </p>
          <p>
            This generally means that DevOps's systems will place this{" "}
            <span className="font-mono">{appVersion.appVersion}</span> as coming
            after{" "}
            <span className="font-mono">
              {
                (appVersion.parentAppVersionInfo as V2controllersAppVersion)
                  .appVersion
              }
            </span>{" "}
            wherever applicable, like for calculcating version diffs.
          </p>
          <NavButton
            to={`../${
              (appVersion.parentAppVersionInfo as V2controllersAppVersion)
                .appVersion
            }`}
            {...AppVersionColors}
          >
            Jump to Parent
          </NavButton>
        </div>
      )}
    <p>
      This App Version was first recorded in Sherlock at{" "}
      <PrettyPrintTime time={appVersion.createdAt} />.
    </p>
    {toEdit && (
      <MutateControls
        name={`${appVersion.chart}/${appVersion.appVersion}`}
        colors={AppVersionColors}
        toEdit={toEdit}
      />
    )}
  </div>
);
