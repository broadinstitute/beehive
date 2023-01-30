import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, useActionData } from "@remix-run/react";
import {
  ClustersApi,
  V2controllersCluster,
} from "@sherlock-js-client/sherlock";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { ClusterEditableFields } from "~/features/sherlock/clusters/edit/cluster-editable-fields";
import { ClusterCreatableFields } from "~/features/sherlock/clusters/new/cluster-creatable-fields";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";

export const handle = {
  breadcrumb: () => <NavLink to="/clusters/new">New</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "New Cluster",
  },
];

export async function action({ request }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const clusterRequest: V2controllersCluster = {
    ...formDataToObject(formData, true),
    requiresSuitability: formData.get("requiresSuitability") === "true",
  };

  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersPost({ cluster: clusterRequest }, forwardIAP(request))
    .then(
      (cluster) => redirect(`/clusters/${cluster.name}`),
      makeErrorResponseReturner(clusterRequest)
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel {...ClusterColors}>
        <ActionBox
          title="Now Creating New Cluster"
          submitText="Click to Create"
          {...ClusterColors}
        >
          <ClusterCreatableFields cluster={errorInfo?.formState} />
          <p className="py-4">Fields below this point can be edited later.</p>
          <ClusterEditableFields cluster={errorInfo?.formState} />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel>
        <FillerText>
          <p>
            Creating a new cluster here lets us track and (attempt) deployments
            to it. It doesn't create the cluster itself.
          </p>
          <p>
            The cluster needs to be recognized by DevOps's systems (Argo,
            specifically). Contact us if you're trying to set something new up.
          </p>
        </FillerText>
      </InsetPanel>
    </>
  );
}
