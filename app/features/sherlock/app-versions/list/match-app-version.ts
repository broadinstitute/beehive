import type { SerializeFrom } from "@remix-run/node";
import type { SherlockAppVersionV3 } from "@sherlock-js-client/sherlock";

export function matchAppVersion(
  appVersion: SerializeFrom<SherlockAppVersionV3>,
  matchText: string,
): boolean {
  return (
    appVersion.appVersion?.includes(matchText) ||
    appVersion.gitBranch?.includes(matchText) ||
    appVersion.gitCommit?.includes(matchText) ||
    false
  );
}
