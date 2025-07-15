import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockEnvironmentV3,
  SherlockServiceAlertV3,
} from "@sherlock-js-client/sherlock";
import { getEnvironmentName } from "../get-environment-name";

export function matchServiceAlert(
  serviceAlert: SerializeFrom<SherlockServiceAlertV3>,
  matchText: string,
  environments:
    | SerializeFrom<SherlockEnvironmentV3>[]
    | SherlockEnvironmentV3[] = [],
): boolean {
  const environmentName = getEnvironmentName(
    serviceAlert.onEnvironment,
    environments,
  );

  return (
    serviceAlert.title?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.message?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.severity?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.onEnvironment
      ?.toLowerCase()
      .includes(matchText.toLowerCase()) ||
    environmentName?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.uuid?.toLowerCase().includes(matchText.toLowerCase()) ||
    serviceAlert.id?.toString().includes(matchText) ||
    false
  );
}
