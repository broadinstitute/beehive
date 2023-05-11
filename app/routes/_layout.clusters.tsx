import { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ClustersApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { clusterSorter } from "~/features/sherlock/clusters/list/cluster-sorter";
import { ListClusterButtonText } from "~/features/sherlock/clusters/list/list-cluster-button-text";
import { matchCluster } from "~/features/sherlock/clusters/list/match-cluster";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: () => <NavLink to="/clusters">Clusters</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Clusters",
  },
];

export async function loader({ request }: LoaderArgs) {
  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersGet({}, handleIAP(request))
    .then((clusters) => clusters.sort(clusterSorter), errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const clusters = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList title="Clusters" {...ClusterColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate="./new"
            {...ClusterColors}
          />
          <MemoryFilteredList
            entries={clusters}
            filterText={filterText}
            filter={matchCluster}
          >
            {(cluster, index) => (
              <NavButton
                to={`./${cluster.name}`}
                key={index.toString()}
                {...ClusterColors}
              >
                <ListClusterButtonText cluster={cluster} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </>
  );
}
