import type { SerializeFrom } from "@remix-run/node";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";

export function getEnvironmentName(
  environmentId: string | undefined,
  environments:
    | SerializeFrom<SherlockEnvironmentV3>[]
    | SherlockEnvironmentV3[],
): string {
  if (!environmentId) {
    return "";
  }

  // If the environmentId is already a name (not numeric), return it
  if (isNaN(Number(environmentId))) {
    return environmentId;
  }

  // Find environment by ID
  const environment = environments.find(
    (env) => env.id?.toString() === environmentId || env.name === environmentId,
  );

  return environment?.name || environmentId;
}
