import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, Params, useLoaderData } from "@remix-run/react";
import {
  ClustersApi,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ClusterColors } from "~/components/content/cluster/cluster-colors";
import { ClusterDetails } from "~/components/content/cluster/cluster-details";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Branch } from "~/components/route-tree/branch";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/clusters/${params.clusterName}`}>
      {params.clusterName}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.clusterName} - Cluster`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersSelectorGet(
      { selector: params.clusterName || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ClusterNameRoute: React.FunctionComponent = () => {
  const cluster = useLoaderData<V2controllersCluster>();
  return (
    <Branch prod={cluster.name === "terra-prod"}>
      <OutsetPanel {...ClusterColors}>
        <ItemDetails subtitle="Kubernetes Cluster" title={cluster.name || ""}>
          <ClusterDetails
            cluster={cluster}
            toChartReleases="./chart-releases"
            toEdit="./edit"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ cluster }} />
    </Branch>
  );
};

export default ClusterNameRoute;
