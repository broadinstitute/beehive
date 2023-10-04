import { SerializeFrom } from "@remix-run/node";
import { SherlockClusterV3 } from "@sherlock-js-client/sherlock";

export const ListClusterButtonText: React.FunctionComponent<{
  cluster: SerializeFrom<SherlockClusterV3>;
}> = ({ cluster }) => (
  <h2 className="font-light">
    {`${cluster.base} / `}
    <span className="font-medium">{cluster.name}</span>
  </h2>
);
