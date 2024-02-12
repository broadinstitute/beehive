import type { SerializeFrom } from "@remix-run/node";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";

export function matchEnvironment(
  environment: SerializeFrom<SherlockEnvironmentV3>,
  matchText: string,
): boolean {
  return (
    environment.lifecycle?.includes(matchText) ||
    environment.base?.includes(matchText) ||
    environment.name?.includes(matchText) ||
    false
  );
}
