import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockClusterV3 } from "@sherlock-js-client/sherlock";
import { ClustersApi, RolesApi } from "@sherlock-js-client/sherlock";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetFiller } from "~/components/layout/outset-filler";

import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "~/errors/helpers/error-response-handlers";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { ClusterEditHelpCopy } from "~/features/sherlock/clusters/cluster-edit-help-copy";
import { ClusterEditableFields } from "~/features/sherlock/clusters/edit/cluster-editable-fields";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useSidebar } from "~/hooks/use-sidebar";
import { useClusterContext } from "~/routes/_layout.clusters.$clusterName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/clusters/${params.clusterName}/edit`}>Edit</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.clusterName} - Cluster - Edit` },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return new RolesApi(SherlockConfiguration)
    .apiRolesV3Get({}, handleIAP(request))
    .catch(errorResponseThrower);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const clusterRequest: SherlockClusterV3 = {
    ...formDataToObject(formData, false),
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
  const roles = useLoaderData<typeof loader>();
  const { cluster } = useClusterContext();
  const errorInfo = useActionData<typeof action>();

  const {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    SidebarComponent,
  } = useSidebar();

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${cluster.name}`}
          submitText="Click to Save Edits"
          {...ClusterColors}
        >
          <ClusterEditableFields
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
            cluster={errorInfo?.formState || cluster}
            roles={roles}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel largeScreenOnly={!isSidebarPresent}>
        {isSidebarPresent ? (
          <SidebarComponent />
        ) : (
          <FillerText>
            <ClusterEditHelpCopy />
          </FillerText>
        )}
      </InsetPanel>
      <OutsetFiller />
    </>
  );
}
