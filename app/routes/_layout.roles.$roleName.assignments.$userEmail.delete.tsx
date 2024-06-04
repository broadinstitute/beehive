import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { RoleAssignmentsApi } from "@sherlock-js-client/sherlock";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { RoleAssignmentDeleteDescription } from "~/features/sherlock/role-assignments/delete/role-assignment-delete-description";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import { SherlockConfiguration } from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useRoleAssignmentContext } from "./_layout.roles.$roleName.assignments.$userEmail";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/roles/${params.roleName}/assignments/${params.userEmail}/delete`}
    >
      Delete
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.userEmail} - Assignmnet - Delete` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  return new RoleAssignmentsApi(SherlockConfiguration)
    .apiRoleAssignmentsV3RoleSelectorUserSelectorDelete({
      userSelector: params.userEmail || "",
      roleSelector: params.roleName || "",
    })
    .then(
      () => redirect(`/roles/${params.roleName}/assignments`),
      makeErrorResponseReturner(),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { role, user, assignment } = useRoleAssignmentContext();

  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${role.name} assignment for ${user.email}`}
          submitText={`Click to Delete`}
          {...RoleColors}
        >
          <RoleAssignmentDeleteDescription
            role={role}
            user={user}
            assignment={assignment}
          />
          <DeletionGuard name={"assignment"} />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
