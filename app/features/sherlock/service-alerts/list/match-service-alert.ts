import type { SerializeFrom } from "@remix-run/node";
import { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock/dist/models/SherlockServiceAlertV3";

export function matchserviceAlert(
  serviceAlert: SerializeFrom<SherlockServiceAlertV3>,
  matchText: string,
): boolean {
  return serviceAlert.uuid?.includes(matchText) || false;
}
