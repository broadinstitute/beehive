import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockUserV3 } from "@sherlock-js-client/sherlock";
import { RoleAssignmentsApi, UsersApi } from "@sherlock-js-client/sherlock";
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
  RoleAssignmentEditableFields,
  roleAssignmentEditableFormDataToObject,
} from "~/features/sherlock/role-assignments/edit/role-assignment-editable-fields";
import { RoleAssignmentCreatableFields } from "~/features/sherlock/role-assignments/new/role-assignment-creatable-fields";
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
    <NavLink to={`/roles/${params.RoleName}/assignments/new`}>New</NavLink>
  ),
};

export const meta: MetaFunction = () => [
  {
    title: "New Role Assignment",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return new UsersApi(SherlockConfiguration)
    .apiUsersV3Get({}, handleIAP(request))
    .catch(errorResponseThrower);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const roleAssignmentRequest =
    roleAssignmentEditableFormDataToObject(formData);
  const userEmail = formData.get("user")?.toString();

  return new RoleAssignmentsApi(SherlockConfiguration)
    .apiRoleAssignmentsV3RoleSelectorUserSelectorPost(
      {
        userSelector: userEmail || "",
        roleSelector: params.roleName || "",
        roleAssignment: roleAssignmentRequest,
      },
      handleIAP(request),
    )
    .then(
      () => redirect(`/roles/${params.roleName}/assignments/${userEmail}`),
      makeErrorResponseReturner(roleAssignmentRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const users = useLoaderData<typeof loader>();
  const { role, selfUser, selfUserIsSuperAdmin } = useRoleContext();

  const errorInfo = useActionData<typeof action>();
  const errUserEmail = (errorInfo?.formState?.userInfo as SherlockUserV3)
    ?.email;

  const [user, setUser] = useState(errUserEmail || selfUser?.email);

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
          title="New Role Assignment"
          submitText="Click to Create"
          {...RoleColors}
        >
          <RoleAssignmentCreatableFields
            user={user}
            setUser={setUser}
            users={users}
            selfUserEmail={selfUser?.email}
            selfUserIsSuperAdmin={selfUserIsSuperAdmin}
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
          />
          <RoleAssignmentEditableFields
            assignment={
              errorInfo?.formState || {
                suspended: false,
                expiresIn: role.defaultGlassBreakDuration,
              }
            }
            role={role}
            selfUserIsSuperAdmin={selfUserIsSuperAdmin}
            creating={true}
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
