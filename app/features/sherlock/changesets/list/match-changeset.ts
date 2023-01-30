import { SerializeFrom } from "@remix-run/node";
import { V2controllersChangeset } from "@sherlock-js-client/sherlock";

export function matchChangeset(
  changeset: SerializeFrom<V2controllersChangeset>,
  matchText: string
): boolean {
  return (
    changeset.chartReleaseInfo?.appVersionExact?.includes(matchText) ||
    changeset.toAppVersionResolver?.includes(matchText) ||
    changeset.chartReleaseInfo?.chartVersionExact?.includes(matchText) ||
    changeset.toChartVersionResolver?.includes(matchText) ||
    false
  );
}
