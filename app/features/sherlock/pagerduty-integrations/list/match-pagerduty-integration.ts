import type { SerializeFrom } from "@remix-run/node";
import type { SherlockPagerdutyIntegrationV3 } from "@sherlock-js-client/sherlock";

export function matchPagerdutyIntegration(
  pagerdutyIntegration: SerializeFrom<SherlockPagerdutyIntegrationV3>,
  matchText: string,
): boolean {
  return (
    pagerdutyIntegration.name?.includes(matchText) ||
    pagerdutyIntegration.pagerdutyID?.includes(matchText) ||
    false
  );
}
