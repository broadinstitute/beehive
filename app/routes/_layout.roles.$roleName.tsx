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
import assert from "assert";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { getFakeRoleByName } from "~/features/sherlock/roles/fake/fake-data";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import { RoleDetails } from "~/features/sherlock/roles/view/role-details";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";
export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/role/${params.roleName}`}>{params.roleName}</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.roleName} - Role` },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return { role: getFakeRoleByName(params.roleName || "") };

  // TODO - OK to use role name in URL params? not sure what kind of
  // server-side validation is in place, it does seem more user-friendly
  // than IDs
  return defer({
    role: await new RolesApi(SherlockConfiguration)
      .apiRolesV3Get({ name: params.roleName || "" }, handleIAP(request))
      .catch(errorResponseThrower)
      .then((roles) => assert(roles.at(0))),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { role } = useLoaderData<typeof loader>();

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
      <Outlet context={{ role }} />
    </>
  );
}

export const useRoleContext = useOutletContext<{
  role: SerializeFrom<typeof loader>["role"];
}>;
