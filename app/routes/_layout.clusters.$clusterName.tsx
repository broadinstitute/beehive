import {
  defer,
  type LoaderArgs,
  type SerializeFrom,
  type V2_MetaFunction,
} from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { CiIdentifiersApi, ClustersApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ProdFlag } from "~/components/layout/prod-flag";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { ClusterDetails } from "~/features/sherlock/clusters/view/cluster-details";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/clusters/${params.clusterName}`}>
      {params.clusterName}
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.clusterName} - Cluster` },
];

export async function loader({ request, params }: LoaderArgs) {
  return defer({
    ciRuns: new CiIdentifiersApi(SherlockConfiguration)
      .apiCiIdentifiersV3SelectorGet(
        {
          selector: `cluster/${params.clusterName}`,
        },
        handleIAP(request),
      )
      .then(
        (ciIdentifier) => ciIdentifier.ciRuns,
        () => [],
      ),
    cluster: await new ClustersApi(SherlockConfiguration)
      .apiClustersV3SelectorGet(
        { selector: params.clusterName || "" },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { cluster, ciRuns } = useLoaderData<typeof loader>();
  return (
    <ProdFlag prod={cluster.name === "terra-prod"}>
      <OutsetPanel {...ClusterColors}>
        <ItemDetails subtitle="Kubernetes Cluster" title={cluster.name || ""}>
          <ClusterDetails
            cluster={cluster}
            initialCiRuns={ciRuns}
            toChartReleases="./chart-releases"
            toEdit="./edit"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ cluster }} />
    </ProdFlag>
  );
}

export const useClusterContext = useOutletContext<{
  cluster: SerializeFrom<typeof loader>["cluster"];
}>;
