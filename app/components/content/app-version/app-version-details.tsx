import { V2controllersAppVersion } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { AppVersionColors } from "./app-version-colors";

export interface AppVersionDetailsProps {
  appVersion: V2controllersAppVersion;
}

export const AppVersionDetails: React.FunctionComponent<
  AppVersionDetailsProps
> = ({ appVersion }) => (
  <div className="flex flex-col space-y-10">
    {appVersion.gitCommit && appVersion.gitBranch && (
      <p>
        This App Version was built from commit{" "}
        <a
          href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}/commit/${appVersion.gitCommit}`}
          className="font-mono decoration-blue-500 underline"
        >
          {appVersion.gitCommit?.substring(0, 7)}
        </a>
        , on the{" "}
        <a
          href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}/tree/${appVersion.gitBranch}`}
          className="font-mono decoration-blue-500 underline"
        >
          {appVersion.gitBranch}
        </a>{" "}
        branch of{" "}
        <a
          href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}`}
          className=" decoration-blue-500 underline"
        >
          {appVersion.chartInfo?.appImageGitRepo}
        </a>
        .
      </p>
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
            sizeClassName="w-[29vw]"
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
  </div>
);