import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";

export function matchEnvironment(
  environment: SerializeFrom<V2controllersEnvironment>,
  matchText: string
): boolean {
  return (
    environment.lifecycle?.includes(matchText) ||
    environment.base?.includes(matchText) ||
    environment.name?.includes(matchText) ||
    false
  );
}
