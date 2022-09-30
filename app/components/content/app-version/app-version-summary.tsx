import { NavButton } from "~/components/interactivity/nav-button";
import { AppVersionColors } from "./app-version-colors";

export interface AppVersionSummaryProps {
  chartName?: string | undefined;
  appImageGitRepo?: string | undefined;
  appVersionResolver?: string | undefined;
  appVersionExact?: string | undefined;
  appVersionCommit?: string | undefined;
  appVersionBranch?: string | undefined;
  renderAppVersionLink: boolean;
}

export const AppVersionSummary: React.FunctionComponent<
  AppVersionSummaryProps
> = ({
  chartName,
  appImageGitRepo,
  appVersionResolver,
  appVersionExact,
  appVersionCommit,
  appVersionBranch,
  renderAppVersionLink,
}) => {
  let explanation: JSX.Element;
  switch (appVersionResolver) {
    case "exact":
      if (appVersionBranch) {
        explanation = (
          <p>
            This app version was directly specified. It happens to come from
            commit{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
              className="font-mono underline decoration-blue-500"
            >
              {appVersionCommit?.substring(0, 7)}
            </a>{" "}
            on the{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/tree/${appVersionBranch}`}
              className="font-mono underline decoration-blue-500"
            >
              {appVersionBranch}
            </a>{" "}
            branch. Refreshing won't affect it.
          </p>
        );
      } else if (appVersionCommit) {
        explanation = (
          <p>
            This app version was directly specified. It happens to come from
            commit{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
              className="font-mono underline decoration-blue-500"
            >
              {appVersionCommit?.substring(0, 7)}
            </a>{" "}
            (no branch known, it might be local somewhere?). Refreshing won't
            affect it.
          </p>
        );
      } else {
        explanation = (
          <p>
            This app version was directly specified. Refreshing won't affect it.
          </p>
        );
      }
      break;
    case "commit":
      if (appVersionBranch) {
        explanation = (
          <p>
            This app version was the most recent from specified commit{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
              className="font-mono underline decoration-blue-500"
            >
              {appVersionCommit?.substring(0, 7)}
            </a>{" "}
            that happens to be on the{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/tree/${appVersionBranch}`}
              className="font-mono underline decoration-blue-500"
            >
              {appVersionBranch}
            </a>{" "}
            branch. Refreshing will recalculate it.
          </p>
        );
      } else {
        explanation = (
          <p>
            This app version was the most recent from specified commit{" "}
            <a
              href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
              className="font-mono underline decoration-blue-500"
            >
              {appVersionCommit?.substring(0, 7)}
            </a>
            . Refreshing will recalculate it.
          </p>
        );
      }
    case "branch":
      explanation = (
        <p>
          This app version was from commit{" "}
          <a
            href={`https://github.com/${appImageGitRepo}/commit/${appVersionCommit}`}
            className="font-mono underline decoration-blue-500"
          >
            {appVersionCommit?.substring(0, 7)}
          </a>
          , the most recent from specified branch{" "}
          <a
            href={`https://github.com/${appImageGitRepo}/tree/${appVersionBranch}`}
            className="font-mono underline decoration-blue-500"
          >
            {appVersionBranch}
          </a>
          . Refreshing will recalculate it.
        </p>
      );
      break;
    default:
      explanation = <p></p>;
      break;
  }
  return (
    <div className="flex flex-col space-y-2">
      <h2 className="font-light text-4xl">
        {`${chartName} app @ ${appVersionExact}`}
      </h2>
      {explanation}
      {renderAppVersionLink && (
        <NavButton
          to={`/charts/${chartName}/app-versions/${appVersionExact}`}
          sizeClassName="w-[29vw]"
          {...AppVersionColors}
        >
          <h2 className="font-medium">Jump to This App Version</h2>
        </NavButton>
      )}
    </div>
  );
};
