import { SerializeFrom } from "@remix-run/node";
import { V2controllersCluster } from "@sherlock-js-client/sherlock";

export function matchCluster(
  cluster: SerializeFrom<V2controllersCluster>,
  matchText: string
): boolean {
  return (
    cluster.name?.includes(matchText) ||
    cluster.base?.includes(matchText) ||
    false
  );
}
