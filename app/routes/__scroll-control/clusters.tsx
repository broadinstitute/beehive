import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import {
  ClustersApi,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ClusterColors } from "~/components/content/cluster/cluster-colors";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => <NavLink to="/clusters">Clusters</NavLink>,
};

export const loader: LoaderFunction = async ({ request }) => {
  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersGet({}, forwardIAP(request))
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ClustersRoute: React.FunctionComponent = () => {
  const clusters = useLoaderData<Array<V2controllersCluster>>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
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
            filter={(cluster, filterText) =>
              cluster.name?.includes(filterText) ||
              cluster.base?.includes(filterText)
            }
          >
            {(cluster, index) => (
              <NavButton
                to={`./${cluster.name}`}
                key={index.toString()}
                {...ClusterColors}
              >
                <h2 className="font-light">
                  {`${cluster.base} / `}
                  <span className="font-medium">{cluster.name}</span>
                </h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </Branch>
  );
};

export default ClustersRoute;
