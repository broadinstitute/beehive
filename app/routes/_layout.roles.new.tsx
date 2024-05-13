import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import { RolesApi, SherlockRoleV3 } from "@sherlock-js-client/sherlock";
import { useState } from "react";
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
import { RoleEditableFields } from "~/features/sherlock/roles/edit/role-editable-fields";
import { roleSorter } from "~/features/sherlock/roles/list/role-sorter";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import { RoleHelpCopy } from "~/features/sherlock/roles/role-help-copy";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useSidebar } from "~/hooks/use-sidebar";

export const handle = {
  breadcrumb: () => <NavLink to="/roles/new">New</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "New Role",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return new RolesApi(SherlockConfiguration)
    .apiRolesV3Get({}, handleIAP(request))
    .then((roles) => roles.sort(roleSorter), errorResponseThrower);
}

export async function action({ request }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const roleRequest: SherlockRoleV3 = {
    ...formDataToObject(formData, true),
    grantsSherlockSuperAdmin:
      formData.get("grantsSherlockSuperAdmin") === "true",
    suspendNonSuitableUsers: formData.get("suspendNonSuitableUsers") === "true",
    canBeGlassBrokenByRole:
      parseInt(formData.get("canBeGlassBrokenByRole")?.toString() || "") ||
      undefined,
  };

  return new RolesApi(SherlockConfiguration)
    .apiRolesV3Post({ role: roleRequest }, handleIAP(request))
    .then(
      (role) => redirect(`/roles/${role.name}`),
      makeErrorResponseReturner(roleRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const roles = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();

  const [breakGlassRole, setBreakGlassRole] = useState(
    roles.find((r) => r.id === errorInfo?.formState?.canBeGlassBrokenByRole),
  );

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
          title="Now Creating New Role"
          submitText="Click to Create"
          {...RoleColors}
        >
          <RoleEditableFields
            role={errorInfo?.formState}
            roles={roles}
            breakGlassRole={breakGlassRole}
            setBreakGlassRole={setBreakGlassRole}
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel largeScreenOnly={!isSidebarPresent}>
        {isSidebarPresent ? (
          <SidebarComponent />
        ) : (
          <FillerText>
            <RoleHelpCopy />
          </FillerText>
        )}
      </InsetPanel>
    </>
  );
}
