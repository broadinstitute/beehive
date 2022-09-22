import { LoaderFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import {
  ClustersApi,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import ListPanel from "~/components/OLD panels/list";
import { catchBoundary, errorBoundary } from "~/helpers/boundaries";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => (
    <NavLink to="/environments/new/select-default-cluster">
      Select Default Cluster
    </NavLink>
  ),
};

export const loader: LoaderFunction = async ({ request }) => {
  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersGet({}, forwardIAP(request))
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const SelectDefaultClusterRoute: FunctionComponent = () => {
  const clusters: Array<V2controllersCluster> = useLoaderData();
  const outletContext = useOutletContext();
  return (
    <div className="flex flex-row h-full">
      <ListPanel
        title="Select Default Cluster"
        entries={clusters}
        to={(cluster) => `./${cluster.name}`}
        filter={(cluster, filter) => cluster.name?.includes(filter)}
        borderClassName="border-green-300"
      >
        {(cluster) => <h2 className="font-medium">{cluster.name}</h2>}
      </ListPanel>
      <Outlet context={outletContext} />
    </div>
  );
};

export default SelectDefaultClusterRoute;
