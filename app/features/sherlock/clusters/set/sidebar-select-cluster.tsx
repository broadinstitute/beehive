import type { SerializeFrom } from "@remix-run/node";
import type { SherlockClusterV3 } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { ListClusterButtonText } from "../list/list-cluster-button-text";
import { matchCluster } from "../list/match-cluster";

export const SidebarSelectCluster: React.FunctionComponent<{
  clusters: SerializeFrom<SherlockClusterV3[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
  title?: string;
}> = ({ clusters, fieldValue, setFieldValue, title = "Select Cluster" }) => (
  <SidebarFilterControlledList
    title={title}
    entries={clusters}
    filterText={fieldValue}
    filter={matchCluster}
    handleListButtonClick={(entry) => setFieldValue(entry.name || "")}
    detectListButtonActive={(entry) => entry.name === fieldValue}
    listButtonTextFactory={(entry) => <ListClusterButtonText cluster={entry} />}
    {...ClusterColors}
  />
);
