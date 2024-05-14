import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { NavLink, useActionData } from "@remix-run/react";
import { RolesApi } from "@sherlock-js-client/sherlock";
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
import {
  RoleEditableFields,
  roleEditableFormDataToObject,
} from "~/features/sherlock/roles/edit/role-editable-fields";
import { roleSorter } from "~/features/sherlock/roles/list/role-sorter";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import { RoleHelpCopy } from "~/features/sherlock/roles/role-help-copy";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useSidebar } from "~/hooks/use-sidebar";
import { useRolesContext } from "./_layout.roles";

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
  const roleRequest = roleEditableFormDataToObject(formData);

  return new RolesApi(SherlockConfiguration)
    .apiRolesV3Post({ role: roleRequest }, handleIAP(request))
    .then(
      (role) => redirect(`/roles/${role.name}`),
      makeErrorResponseReturner(roleRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { roles } = useRolesContext();
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
      <OutsetPanel {...RoleColors}>
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
