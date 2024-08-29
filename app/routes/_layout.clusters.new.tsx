import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockClusterV3 } from "@sherlock-js-client/sherlock";
import { ClustersApi, RolesApi } from "@sherlock-js-client/sherlock";
import { InsetPanel } from "~/components/layout/inset-panel";
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
import { ClusterCreatableFields } from "~/features/sherlock/clusters/new/cluster-creatable-fields";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useSidebar } from "~/hooks/use-sidebar";

export const handle = {
  breadcrumb: () => <NavLink to="/clusters/new">New</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "New Cluster",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return new RolesApi(SherlockConfiguration)
    .apiRolesV3Get({}, handleIAP(request))
    .catch(errorResponseThrower);
}

export async function action({ request }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const clusterRequest: SherlockClusterV3 = {
    ...formDataToObject(formData, true),
  };

  return new ClustersApi(SherlockConfiguration)
    .apiClustersV3Post({ cluster: clusterRequest }, handleIAP(request))
    .then(
      (cluster) => redirect(`/clusters/${cluster.name}`),
      makeErrorResponseReturner(clusterRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const roles = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();

  const {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    SidebarComponent,
  } = useSidebar();

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
          <ClusterEditableFields
            setSidebarFilterText={setSidebarFilterText}
            setSidebar={setSidebar}
            cluster={errorInfo?.formState}
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
    </>
  );
}
