import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import { RolesApi } from "@sherlock-js-client/sherlock";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "~/errors/helpers/error-response-handlers";
import { RoleDeleteDescription } from "~/features/sherlock/roles/delete/role-delete-description";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { getOneRoleOrError, useRoleContext } from "./_layout.roles.$roleName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/roles/${params.roleName}/delete`}>Delete</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.roleName} - Role - Delete` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const role = await new RolesApi(SherlockConfiguration)
    .apiRolesV3Get({ name: params.roleName || "" }, handleIAP(request))
    .catch(errorResponseThrower)
    .then(getOneRoleOrError);

  if (role.id === undefined) {
    throw new Error("undefined role ID");
  }

  return new RolesApi(SherlockConfiguration)
    .apiRolesV3IdDelete({ id: role.id }, handleIAP(request))
    .then(() => redirect("/roles"), makeErrorResponseReturner());
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { role } = useRoleContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${role.name}`}
          submitText={`Click to Delete`}
          {...RoleColors}
        >
          <RoleDeleteDescription role={role} />
          <DeletionGuard name={role.name} />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
