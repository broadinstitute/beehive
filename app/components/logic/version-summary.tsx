import {
  V2controllersChangeset,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";

export interface VersionSummaryProps {
  currentVersions: V2controllersChartRelease;
  newVersions?: V2controllersChangeset | undefined;
}

function makeVersionTableRow(
  title: string,
  currentValue: string | undefined,
  newValue: string | undefined
): React.ReactNode {
  return (
    <tr>
      <td className="w-24">{title}:</td>
      <td></td>
      <td className={newValue !== currentValue ? "font-semibold" : ""}>
        {currentValue || "None"}
        {newValue !== currentValue ? ` → ${newValue || "None"}` : ""}
      </td>
    </tr>
  );
}

export const VersionSummary: React.FunctionComponent<VersionSummaryProps> = ({
  currentVersions,
  newVersions,
}) => (
  <div className="flex flex-col gap-4 max-w-[29vw]">
    <div className="border-rose-300 border-2 rounded-2xl p-4 bg-rose-50">
      <h3 className="text-xl font-light">App Version:</h3>
      <table className="table-fixed">
        <tbody>
          {makeVersionTableRow(
            "Following",
            currentVersions.appVersionResolver,
            newVersions?.toAppVersionResolver ??
              currentVersions.appVersionResolver
          )}
          {(currentVersions.appVersionExact !== "none" ||
            newVersions?.toAppVersionExact !== "none") &&
            makeVersionTableRow(
              "Exact",
              currentVersions.appVersionExact,
              newVersions?.toAppVersionExact ?? currentVersions.appVersionExact
            )}
          {(currentVersions.appVersionExact !== "none" ||
            newVersions?.toAppVersionExact !== "none") &&
            makeVersionTableRow(
              "Git Commit",
              currentVersions.appVersionCommit,
              newVersions?.toAppVersionCommit ??
                currentVersions.appVersionCommit
            )}
          {(currentVersions.appVersionExact !== "none" ||
            newVersions?.toAppVersionExact !== "none") &&
            makeVersionTableRow(
              "Git Branch",
              currentVersions.appVersionBranch,
              newVersions?.toAppVersionBranch ??
                currentVersions.appVersionBranch
            )}
        </tbody>
      </table>
    </div>
    <div className="grid grid-cols-2 gap-4 border-violet-300 border-2 rounded-2xl p-4 bg-violet-50">
      <div>
        <h3 className="text-xl font-light">Chart Version: </h3>
        <table className="table-auto">
          <tbody>
            {makeVersionTableRow(
              "Following",
              currentVersions.chartVersionResolver,
              newVersions?.toChartVersionResolver ??
                currentVersions.chartVersionResolver
            )}
            {makeVersionTableRow(
              "Exact",
              currentVersions.chartVersionExact,
              newVersions?.toChartVersionExact ??
                currentVersions.chartVersionExact
            )}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-xl font-light">Helmfile:</h3>
        <table className="table-auto">
          <tbody>
            {makeVersionTableRow(
              "Git Ref",
              currentVersions.helmfileRef,
              newVersions?.toHelmfileRef ?? currentVersions.helmfileRef
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
