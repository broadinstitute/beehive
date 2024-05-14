import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  defer,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { RolesApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
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
  return defer({
    role: await new RolesApi(SherlockConfiguration)
      .apiRolesV3SelectorGet(
        { selector: params.roleName || "" },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { role } = useLoaderData<typeof loader>();
  const { roles } = useRolesContext();

  return (
    <>
      <OutsetPanel {...RoleColors}>
        <ItemDetails
          subtitle={`${
            role?.canBeGlassBrokenByRole ? "Break-glass" : "Manually assigned"
          } role`}
          title={role?.name || ""}
        >
          <RoleDetails
            role={role}
            toAssignments="./role-assignments"
            toEdit="./edit"
            toDelete={"./delete"}
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ role, roles }} />
    </>
  );
}

export const useRoleContext = useOutletContext<
  {
    role: SerializeFrom<typeof loader>["role"];
  } & ReturnType<typeof useRolesContext>
>;
