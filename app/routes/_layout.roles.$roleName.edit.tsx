import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { RolesApi } from "@sherlock-js-client/sherlock";

import { useState } from "react";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  RoleEditableFields,
  roleEditableFormDataToObject,
} from "~/features/sherlock/roles/edit/role-editable-fields";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import { RoleHelpCopy } from "~/features/sherlock/roles/role-help-copy";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useSidebar } from "~/hooks/use-sidebar";
import { useRoleContext } from "./_layout.roles.$roleName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/roles/${params.roleName}/edit`}>Edit</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.roleName} - Role - Edit` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const role = roleEditableFormDataToObject(formData);

  return new RolesApi(SherlockConfiguration)
    .apiRolesV3SelectorPatch(
      {
        selector: params.roleName || "",
        role: role,
      },
      handleIAP(request),
    )
    .then(
      (role) => redirect(`/roles/${role.name}`),
      makeErrorResponseReturner(role),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { role, roles } = useRoleContext();
  const errorInfo = useActionData<typeof action>();

  const [breakGlassRole, setBreakGlassRole] = useState(
    roles.find((r) => r.id === errorInfo?.formState?.canBeGlassBrokenByRole) ||
      roles.find((r) => r.id === role.canBeGlassBrokenByRole),
  );

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
          title={`Now Editing ${role.name}`}
          submitText="Click to Save Edits"
          {...RoleColors}
        >
          <RoleEditableFields
            role={errorInfo?.formState || role}
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
