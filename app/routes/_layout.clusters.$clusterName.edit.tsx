import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import { ClustersApi, SherlockClusterV3 } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";

import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { ClusterEditableFields } from "~/features/sherlock/clusters/edit/cluster-editable-fields";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useClusterContext } from "~/routes/_layout.clusters.$clusterName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/clusters/${params.clusterName}/edit`}>Edit</NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.clusterName} - Cluster - Edit` },
];

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const clusterRequest: SherlockClusterV3 = {
    ...formDataToObject(formData, false),
    requiresSuitability: formData.get("requiresSuitability") === "true",
  };

  return new ClustersApi(SherlockConfiguration)
    .apiClustersV3SelectorPatch(
      { selector: params.clusterName || "", cluster: clusterRequest },
      handleIAP(request),
    )
    .then(
      (cluster) => redirect(`/clusters/${cluster.name}`),
      makeErrorResponseReturner(clusterRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { cluster } = useClusterContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${cluster.name}`}
          submitText="Click to Save Edits"
          {...ClusterColors}
        >
          <ClusterEditableFields cluster={errorInfo?.formState || cluster} />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
