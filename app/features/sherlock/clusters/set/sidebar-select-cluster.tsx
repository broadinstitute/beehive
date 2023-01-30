import { SerializeFrom } from "@remix-run/node";
import { V2controllersCluster } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { ListClusterButtonText } from "../list/list-cluster-button-text";
import { matchCluster } from "../list/match-cluster";

export const SidebarSelectCluster: React.FunctionComponent<{
  clusters: SerializeFrom<V2controllersCluster[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
}> = ({ clusters, fieldValue, setFieldValue }) => (
  <SidebarFilterControlledList
    title="Select Cluster"
    entries={clusters}
    filterText={fieldValue}
    filter={matchCluster}
    handleListButtonClick={(entry) => setFieldValue(entry.name || "")}
    detectListButtonActive={(entry) => entry.name === fieldValue}
    listButtonTextFactory={(entry) => <ListClusterButtonText cluster={entry} />}
    {...ClusterColors}
  />
);
