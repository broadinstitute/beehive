import type { SerializeFrom } from "@remix-run/node";
import type { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock";

export function matchServiceAlert(
  serviceAlert: SerializeFrom<SherlockServiceAlertV3>,
  matchText: string,
): boolean {
  return (
    serviceAlert.title?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.message?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.severity?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.onEnvironment
      ?.toLowerCase()
      .includes(matchText.toLowerCase()) ||
    serviceAlert.uuid?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.id?.toString().includes(matchText) ||
    false
  );
}
