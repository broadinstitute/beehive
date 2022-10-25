import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import { NavLink, useActionData } from "@remix-run/react";
import {
  ClustersApi,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ClusterColors } from "~/components/content/cluster/cluster-colors";
import { ClusterCreatableFields } from "~/components/content/cluster/cluster-creatable-fields";
import { ClusterEditableFields } from "~/components/content/cluster/cluster-editable-fields";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/session.server";

export const handle = {
  breadcrumb: () => <NavLink to="/clusters/new">New</NavLink>,
};

export const meta: MetaFunction = () => ({
  title: "New Cluster",
});

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const clusterRequest: V2controllersCluster = {
    ...formDataToObject(formData, true),
    requiresSuitability: formData.get("requiresSuitability") === "true",
  };

  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersPost({ cluster: clusterRequest }, forwardIAP(request))
    .then(
      (cluster) => redirect(`/clusters/${cluster.name}`),
      makeErrorResponserReturner(clusterRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const NewRoute: React.FunctionComponent = () => {
  const actionData = useActionData<ActionErrorInfo<V2controllersCluster>>();
  return (
    <Branch>
      <OutsetPanel {...ClusterColors}>
        <ActionBox
          title="Now Creating New Cluster"
          submitText="Click to Create"
          {...ClusterColors}
        >
          <ClusterCreatableFields cluster={actionData?.faultyRequest} />
          <p className="py-4">Fields below this point can be edited later.</p>
          <ClusterEditableFields cluster={actionData?.faultyRequest} />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
      <Leaf>
        <InsetPanel>
          <FillerText>
            <p>
              Creating a new cluster here lets us track and (attempt)
              deployments to it. It doesn't create the cluster itself.
            </p>
            <p>
              The cluster needs to be recognized by DevOps's systems (Argo,
              specifically). Contact us if you're trying to set something new
              up.
            </p>
          </FillerText>
        </InsetPanel>
      </Leaf>
    </Branch>
  );
};

export default NewRoute;
