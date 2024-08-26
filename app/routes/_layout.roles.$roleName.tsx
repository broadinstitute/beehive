import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { RolesApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { selfUserCanBreakGlassIntoRole } from "~/features/sherlock/roles/list/self-user-can-break-glass-into-role";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import { RoleDetails } from "~/features/sherlock/roles/view/role-details";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";
import { useRolesContext } from "./_layout.roles";
export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/roles/${params.roleName}`}>{params.roleName}</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.roleName} - Role` },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return {
    role: await new RolesApi(SherlockConfiguration)
      .apiRolesV3SelectorGet(
        { selector: params.roleName || "" },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  };
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { role } = useLoaderData<typeof loader>();
  const context = useRolesContext();
  const { roles, selfUser, selfUserIsSuperAdmin } = context;

  const roleAssignableBySelfUser =
    selfUserIsSuperAdmin ||
    selfUserCanBreakGlassIntoRole(selfUser.email || "", role, roles);

  return (
    <>
      <OutsetPanel {...RoleColors}>
        <ItemDetails
          subtitle={`${
            role?.canBeGlassBrokenByRole ? "Break-Glass" : "Manually Assigned"
          } Role`}
          title={role?.name || ""}
        >
          <RoleDetails
            role={role}
            toAssignments="./assignments"
            toEdit={selfUserIsSuperAdmin ? "./edit" : undefined}
            toDelete={selfUserIsSuperAdmin ? "./delete" : undefined}
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ role, roleAssignableBySelfUser, ...context }} />
    </>
  );
}

export const useRoleContext = useOutletContext<
  {
    role: SerializeFrom<typeof loader>["role"];
    roleAssignableBySelfUser: boolean;
  } & ReturnType<typeof useRolesContext>
>;
