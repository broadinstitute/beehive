import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import {
  ClustersApi,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Branch } from "~/components/route-tree/branch";
import { ClusterColors, ClusterDetails } from "~/components/content/cluster";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/clusters/${params.clusterName}`}>
        {params.clusterName}
      </NavLink>
    );
  },
};

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
    <Branch>
      <OutsetPanel {...ClusterColors}>
        <ItemDetails subtitle="Kubernetes Cluster" title={cluster.name || ""}>
          <ClusterDetails
            cluster={cluster}
            toChartReleases="./chart-releases"
            // toEdit="./edit"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ cluster }} />
    </Branch>
  );
};

export default ClusterNameRoute;
