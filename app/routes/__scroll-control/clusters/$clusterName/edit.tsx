import { ActionFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useOutletContext,
} from "@remix-run/react";
import {
  ClustersApi,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { verifyAuthenticityToken } from "remix-utils";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ClusterColors } from "~/components/content/cluster/cluster-colors";
import { ClusterEditableFields } from "~/components/content/cluster/cluster-editable-fields";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/clusters/${params.clusterName}/edit`}>Edit</NavLink>
  ),
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  const formData = await request.formData();
  const clusterRequest: V2controllersCluster = {
    ...formDataToObject(formData, false),
    requiresSuitability: formData.get("requiresSuitability") === "true",
  };

  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersSelectorPatch(
      { selector: params.clusterName || "", cluster: clusterRequest },
      forwardIAP(request)
    )
    .then(
      (cluster) => redirect(`/clusters/${cluster.name}`),
      makeErrorResponserReturner(clusterRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EditRoute: React.FunctionComponent = () => {
  const { cluster } = useOutletContext<{ cluster: V2controllersCluster }>();
  const actionData = useActionData<ActionErrorInfo<V2controllersCluster>>();
  return (
    <Leaf>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${cluster.name}`}
          submitText="Click to Save Edits"
          {...ClusterColors}
        >
          <ClusterEditableFields
            cluster={actionData?.faultyRequest || cluster}
          />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Leaf>
  );
};

export default EditRoute;
