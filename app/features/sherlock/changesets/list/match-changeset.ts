import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChangesetV3 } from "@sherlock-js-client/sherlock";

export function matchChangeset(
  changeset: SerializeFrom<SherlockChangesetV3>,
  matchText: string,
): boolean {
  return (
    changeset.chartReleaseInfo?.appVersionExact?.includes(matchText) ||
    changeset.toAppVersionResolver?.includes(matchText) ||
    changeset.chartReleaseInfo?.chartVersionExact?.includes(matchText) ||
    changeset.toChartVersionResolver?.includes(matchText) ||
    false
  );
}
