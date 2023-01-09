import { Link } from "@remix-run/react";
import { NavButton } from "~/components/interactivity/nav-button";
import { AppVersionColors } from "./app-version-colors";

export interface AppVersionSummaryProps {
  chartName?: string;
  appImageGitRepo?: string;
  appVersionResolver?: string;
  appVersionExact?: string;
  appVersionFollowChartRelease?: string;
  appVersionCommit?: string;
  appVersionBranch?: string;
  firecloudDevelopRef?: string;
  renderAppVersionLink: boolean;
}

export const AppVersionSummary: React.FunctionComponent<
  AppVersionSummaryProps
> = ({
  chartName,
  appImageGitRepo,
  appVersionResolver,
  appVersionExact,
  appVersionFollowChartRelease,
  appVersionCommit,
  appVersionBranch,
  firecloudDevelopRef,
  renderAppVersionLink,
}) => {
  let extraGitInfo: JSX.Element | null = null;
  if (appVersionBranch) {
    extraGitInfo = (
      <span>
        {" "}
        It happens to come from commit{" "}
        <a
          href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
          className="font-mono underline decoration-color-link-underline"
        >
          {appVersionCommit?.substring(0, 7)}
        </a>{" "}
        on the{" "}
        <a
          href={`https://github.com/${appImageGitRepo}/tree/${appVersionBranch}`}
          className="font-mono underline decoration-color-link-underline"
        >
          {appVersionBranch}
        </a>{" "}
        branch.
      </span>
    );
  } else if (appVersionCommit) {
    extraGitInfo = (
      <span>
        {" "}
        It happens to come from commit{" "}
        <a
          href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
          className="font-mono underline decoration-color-link-underline"
        >
          {appVersionCommit?.substring(0, 7)}
        </a>{" "}
        (no branch known, it might be local somewhere?).
      </span>
    );
  }
  let explanation: JSX.Element;
  switch (appVersionResolver) {
    case "exact":
      explanation = (
        <p>
          This app version was directly specified.{extraGitInfo} Refreshing the
          versions won't affect it.
        </p>
      );
      break;
    case "follow":
      explanation = (
        <p>
          This app version was the version in{" "}
          {appVersionFollowChartRelease ? (
            <Link
              to={`/r/chart-release/${appVersionFollowChartRelease}`}
              className="underline decoration-color-link-underline"
            >
              {appVersionFollowChartRelease}
            </Link>
          ) : (
            "the followed instance"
          )}{" "}
          during the last refresh.{extraGitInfo} Refreshing the versions will
          get whatever is there currently.
        </p>
      );
      break;
    case "commit":
      if (appVersionBranch) {
        explanation = (
          <p>
            This app version was the most recent from specified commit{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
              className="font-mono underline decoration-color-link-underline"
            >
              {appVersionCommit?.substring(0, 7)}
            </a>{" "}
            that happens to be on the{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/tree/${appVersionBranch}`}
              className="font-mono underline decoration-color-link-underline"
            >
              {appVersionBranch}
            </a>{" "}
            branch. Refreshing the versions will recalculate it.
          </p>
        );
      } else {
        explanation = (
          <p>
            This app version was the most recent from specified commit{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
              className="font-mono underline decoration-color-link-underline"
            >
              {appVersionCommit?.substring(0, 7)}
            </a>
            . Refreshing the versions will recalculate it.
          </p>
        );
      }
      break;
    case "branch":
      explanation = (
        <p>
          This app version was from commit{" "}
          <a
            href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
            className="font-mono underline decoration-color-link-underline"
          >
            {appVersionCommit?.substring(0, 7)}
          </a>
          , the most recent from specified branch{" "}
          <a
            href={`https://github.com/${appImageGitRepo}/tree/${appVersionBranch}`}
            className="font-mono underline decoration-color-link-underline"
          >
            {appVersionBranch}
          </a>
          . Refreshing the versions will recalculate it.
        </p>
      );
      break;
    default:
      explanation = <p></p>;
      break;
  }
  return (
    <div className="flex flex-col space-y-2">
      <h2 className="font-light text-4xl text-color-header-text">
        {`${chartName} app @ ${appVersionExact}`}
      </h2>
      {explanation}
      {firecloudDevelopRef && (
        <p>
          Configuration uses values from firecloud-develop's{" "}
          <a
            href={`https://github.com/broadinstitute/firecloud-develop/tree/${firecloudDevelopRef}`}
            className="font-mono underline decoration-color-link-underline"
          >
            {firecloudDevelopRef}
          </a>
          .
        </p>
      )}
      {renderAppVersionLink && (
        <NavButton
          to={`/charts/${chartName}/app-versions/${appVersionExact}`}
          {...AppVersionColors}
        >
          <h2 className="font-medium">View Details of This App Version</h2>
        </NavButton>
      )}
    </div>
  );
};
