import { LinkChip } from "~/components/interactivity/link-chip";
import { ClusterColors } from "./cluster-colors";

export const ClusterLinkChip: React.FunctionComponent<{
  cluster: string;
  justDefault?: boolean;
  arrow?: boolean;
}> = ({ cluster, justDefault = false, arrow }) => (
  <LinkChip
    text={`${justDefault ? "Default " : ""}Cluster: ${cluster}`}
    to={`/clusters/${cluster}`}
    arrow={arrow}
    {...ClusterColors}
  />
);

export const NamespaceLinkChip: React.FunctionComponent<{
  cluster: string;
  namespace: string;
  arrow?: boolean;
}> = ({ cluster, namespace, arrow }) => (
  <LinkChip
    text={`Namespace: ${namespace}`}
    to={`/clusters/${cluster}/${namespace}/chart-releases`}
    arrow={arrow}
    {...ClusterColors}
  />
);
