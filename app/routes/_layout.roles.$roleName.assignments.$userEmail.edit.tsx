import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { RoleAssignmentsApi } from "@sherlock-js-client/sherlock";

import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  RoleAssignmentEditableFields,
  roleAssignmentEditableFormDataToObject,
} from "~/features/sherlock/role-assignments/edit/role-assignment-editable-fields";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import { SherlockConfiguration } from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useRoleAssignmentContext } from "./_layout.roles.$roleName.assignments.$userEmail";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/roles/${params.roleName}/assignments/${params.userEmail}/edit`}
    >
      Edit
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.userEmail} - Role Assignment - Edit` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const assignment = roleAssignmentEditableFormDataToObject(formData);

  return new RoleAssignmentsApi(SherlockConfiguration)
    .apiRoleAssignmentsV3RoleSelectorUserSelectorPatch({
      userSelector: params.userEmail || "",
      roleSelector: params.roleName || "",
      roleAssignment: assignment,
    })
    .then(
      () =>
        redirect(`/roles/${params.roleName}/assignments/${params.userEmail}`),
      makeErrorResponseReturner(assignment),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { role, user, selfUserIsSuperAdmin, assignment } =
    useRoleAssignmentContext();
  const errorInfo = useActionData<typeof action>();

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Edit Assignment`}
          submitText="Click to Save Edits"
          {...RoleColors}
        >
          <RoleAssignmentEditableFields
            role={role}
            assignment={errorInfo?.formState || assignment}
            selfUserIsSuperAdmin={selfUserIsSuperAdmin}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
    </>
  );
}
