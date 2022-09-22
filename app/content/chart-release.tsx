import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { VersionSummary } from "~/components/logic/version-summary";
import { ChangesetColors } from "./changeset";
import { ChartColors } from "./chart";

export const ChartReleaseColors = ChartColors;

export interface ChartReleaseDetailsProps {
  chartRelease: V2controllersChartRelease;
  toChangesets?: string | undefined;
  toEdit?: string | undefined;
  toDelete?: string | undefined;
}

export const ChartReleaseDetails: React.FunctionComponent<
  ChartReleaseDetailsProps
> = ({ chartRelease, toChangesets, toEdit, toDelete }) => (
  <div className="flex flex-col space-y-10">
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-light">Current Versions:</h2>
      <VersionSummary currentVersions={chartRelease} />
      {toChangesets && (
        <NavButton
          to={toChangesets}
          sizeClassName="w-[29vw]"
          {...ChangesetColors}
        >
          Change Versions
        </NavButton>
      )}
    </div>
    {(toEdit || toDelete) && (
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-light">Change {chartRelease.name}:</h2>
        {toEdit && (
          <NavButton
            to={toEdit}
            sizeClassName="w-[29vw]"
            {...ChartReleaseColors}
          >
            Edit
          </NavButton>
        )}
        {toDelete && (
          <NavButton
            to={toDelete}
            sizeClassName="w-[29vw]"
            {...ChartReleaseColors}
          >
            Delete
          </NavButton>
        )}
      </div>
    )}
  </div>
);
