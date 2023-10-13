import { SerializeFrom } from "@remix-run/node";
import { SherlockAppVersionV3 } from "@sherlock-js-client/sherlock";

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
