import { SerializeFrom } from "@remix-run/node";
import { V2controllersPagerdutyIntegration } from "@sherlock-js-client/sherlock";

export function matchPagerdutyIntegration(
  pagerdutyIntegration: SerializeFrom<V2controllersPagerdutyIntegration>,
  matchText: string
): boolean {
  return (
    pagerdutyIntegration.name?.includes(matchText) ||
    pagerdutyIntegration.pagerdutyID?.includes(matchText) ||
    false
  );
}
