import { LinkChip } from "~/components/interactivity/link-chip";
import { ClusterColors } from "./cluster-colors";

export const ClusterLinkChip: React.FunctionComponent<{
  cluster: string;
}> = ({ cluster }) => (
  <LinkChip
    text={`Cluster: ${cluster}`}
    to={`/clusters/${cluster}`}
    {...ClusterColors}
  />
);

export const NamespaceLinkChip: React.FunctionComponent<{
  cluster: string;
  namespace: string;
}> = ({ cluster, namespace }) => (
  <LinkChip
    text={`Namespace: ${namespace}`}
    to={`/clusters/${cluster}/${namespace}/chart-releases`}
    {...ClusterColors}
  />
);
