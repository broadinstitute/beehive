import { SerializeFrom } from "@remix-run/node";
import { V2controllersAppVersion } from "@sherlock-js-client/sherlock";

export function matchAppVersion(
  appVersion: SerializeFrom<V2controllersAppVersion>,
  matchText: string
): boolean {
  return (
    appVersion.appVersion?.includes(matchText) ||
    appVersion.gitBranch?.includes(matchText) ||
    appVersion.gitCommit?.includes(matchText) ||
    false
  );
}
