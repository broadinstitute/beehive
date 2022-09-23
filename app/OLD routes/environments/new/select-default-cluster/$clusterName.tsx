import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useOutletContext, useParams } from "@remix-run/react";
import {
  ClustersApi,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import ActionButton from "~/components/components/interactivity/action-button";
import ViewPanel from "~/components/OLD panels/view";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink
        to={`/environments/new/select-default-cluster/${params.clusterName}`}
      >
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

const EnvironmentsNewSelectDefaultClusterClusterNameRoute: FunctionComponent =
  () => {
    const cluster: V2controllersCluster = useLoaderData();
    const { setDefaultCluster } = useOutletContext<{
      setDefaultCluster: React.Dispatch<React.SetStateAction<string>>;
    }>();
    const ref = useRef(null);
    useEffect(() => {
      (ref.current as Element | null)?.scrollIntoView();
    }, [cluster]);
    return (
      <div className="grow h-full" ref={ref}>
        <ViewPanel
          title={cluster.name}
          subtitle="Kubernetes Cluster"
          borderClassName="border-green-300"
        >
          TODO
          <ActionButton
            borderClassName="border-green-300"
            type="button"
            onClick={() => setDefaultCluster(cluster.name || "")}
          >
            <h2 className="font-medium">Set as Default Cluster</h2>
          </ActionButton>
        </ViewPanel>
      </div>
    );
  };

export default EnvironmentsNewSelectDefaultClusterClusterNameRoute;
