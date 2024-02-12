import type { SerializeFrom } from "@remix-run/node";
import type { SherlockClusterV3 } from "@sherlock-js-client/sherlock";

export function matchCluster(
  cluster: SerializeFrom<SherlockClusterV3>,
  matchText: string,
): boolean {
  return (
    cluster.name?.includes(matchText) ||
    cluster.base?.includes(matchText) ||
    false
  );
}
