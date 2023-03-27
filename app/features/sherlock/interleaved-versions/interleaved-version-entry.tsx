import { SerializeFrom } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { PanelSize, panelSizeToInnerClassName } from "~/helpers/panel-size";
import { transitionView } from "~/helpers/transition-view";
import { AppVersionColors } from "../app-versions/app-version-colors";
import { ChartVersionColors } from "../chart-versions/chart-version-colors";
import { InterleavedVersion } from "./interleave-version-promises";

export const InterleavedVersionEntry: React.FunctionComponent<{
  entry: SerializeFrom<InterleavedVersion>;
  size?: PanelSize;
}> = ({ entry, size = "one-fourth" }) => {
  const [minimized, setMinimized] = useState(true);
  return (
    <div
      className={`h-fit ${panelSizeToInnerClassName(
        size
      )} bg-color-near-bg rounded-2xl shadow-md border-2 ${
        entry.type === "app"
          ? AppVersionColors.borderClassName
          : ChartVersionColors.borderClassName
      } flex flex-col gap-2 px-4 py-2 text-color-body-text`}
      style={{
        // @ts-expect-error
        "view-transition-name": `${entry.type}${entry.version.id}`,
      }}
    >
      <div
        className="flex flex-row gap-4 place-items-center cursor-pointer"
        onClick={() =>
          transitionView(() => setMinimized((previous) => !previous))
        }
      >
        <h2 className="text-xl font-medium grow text-color-header-text">
          {entry.type === "app"
            ? `app @ ${entry.version.appVersion}`
            : `chart @ ${entry.version.chartVersion}`}
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            transitionView(() => setMinimized((previous) => !previous));
          }}
          className="hover:bg-color-icon-button-hover active:bg-color-icon-button-down rounded-full p-1"
        >
          {minimized ? (
            <Plus className="fill-color-header-text" />
          ) : (
            <Minus className="fill-color-header-text" />
          )}
        </button>
      </div>
      {entry.version.description && (
        <PrettyPrintDescription
          description={entry.version.description}
          repo={
            entry.type === "app"
              ? entry.version.chartInfo?.appImageGitRepo
              : entry.version.chartInfo?.chartRepo === "terra-helm"
              ? "broadinstitute/terra-helmfile"
              : undefined
          }
          className={`break-words font-light text-xl ${
            minimized ? "line-clamp-3" : "line-clamp-none"
          }`}
        />
      )}
      {!minimized && (
        <Link
          target="_blank"
          to={`/charts/${entry.version.chart}/${entry.type}-versions/${
            entry.type === "app"
              ? entry.version.appVersion
              : entry.version.chartVersion
          }/edit`}
          className="font-light text-sm underline decoration-color-link-underline"
        >
          Edit Description ↗
        </Link>
      )}
      {!minimized &&
        entry.type === "app" &&
        entry.version.chartInfo?.appImageGitRepo &&
        entry.version.gitCommit && (
          <a
            href={`https://github.com/${entry.version.chartInfo?.appImageGitRepo}/commit/${entry.version.gitCommit}`}
            target="_blank"
            className="font-light text-sm underline decoration-color-link-underline"
          >
            {`Commit ${entry.version.gitCommit?.substring(0, 7)} ↗`}
          </a>
        )}

      {entry.version.createdAt && (
        <PrettyPrintTime
          time={entry.version.createdAt}
          className="text-sm font-light"
        />
      )}
    </div>
  );
};
