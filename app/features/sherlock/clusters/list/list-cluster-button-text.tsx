import { SerializeFrom } from "@remix-run/node";
import { V2controllersCluster } from "@sherlock-js-client/sherlock";

export const ListClusterButtonText: React.FunctionComponent<{
  cluster: SerializeFrom<V2controllersCluster>;
}> = ({ cluster }) => (
  <h2 className="font-light">
    {`${cluster.base} / `}
    <span className="font-medium">{cluster.name}</span>
  </h2>
);
