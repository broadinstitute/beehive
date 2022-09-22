import {
  V2controllersChartRelease,
  V2controllersChangeset,
} from "@sherlock-js-client/sherlock";
import { VersionSummary } from "~/components/logic/version-summary";
import { DataTypeColors } from "./interfaces";

export const ChangesetColors: DataTypeColors = {
  borderClassName: "border-zinc-400",
  backgroundClassName: "bg-zinc-50",
};

export interface ChangesetApplyDetailsProps {
  chartRelease: V2controllersChartRelease;
  changeset: V2controllersChangeset;
}

export const ChangesetApplyDetails: React.FunctionComponent<
  ChangesetApplyDetailsProps
> = ({ chartRelease, changeset }) => (
  <div>
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-light">Version Changes:</h2>
      <VersionSummary currentVersions={chartRelease} newVersions={changeset} />
    </div>
  </div>
);
