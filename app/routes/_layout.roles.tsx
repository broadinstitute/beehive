import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import type { SherlockRoleV3 } from "@sherlock-js-client/sherlock";
import { RolesApi, UsersApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { ListRoleButtonText } from "~/features/sherlock/roles/list/list-role-button-text";
import { matchRole } from "~/features/sherlock/roles/list/match-role";
import { roleSorter } from "~/features/sherlock/roles/list/role-sorter";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";

export const handle = {
  breadcrumb: () => <NavLink to="/roles">Roles</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "Roles",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const [roles, selfUser] = await Promise.all([
    new RolesApi(SherlockConfiguration)
      .apiRolesV3Get({}, handleIAP(request))
      .then((roles) => roles.sort(roleSorter), errorResponseThrower),
    new UsersApi(SherlockConfiguration)
      .apiUsersV3SelectorGet({ selector: "self" }, handleIAP(request))
      .catch(errorResponseThrower),
  ]);

  return {
    roles: roles,
    selfUser: selfUser,
    selfUserIsSuperAdmin:
      selfUser.assignments?.some(
        (assignment) =>
          (assignment?.roleInfo as SherlockRoleV3)?.grantsSherlockSuperAdmin,
      ) || false,
  };
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const context = useLoaderData<typeof loader>();
  const { roles, selfUserIsSuperAdmin } = context;
  const { roleName: currentPathRole } = useParams();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList title="Roles" {...RoleColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate={selfUserIsSuperAdmin ? "./new" : undefined}
            {...RoleColors}
          />
          <MemoryFilteredList
            entries={roles}
            filterText={filterText}
            filter={matchRole}
          >
            {(role, index) => (
              <NavButton
                to={`./${role.name}`}
                key={index.toString()}
                forceActive={currentPathRole === role.name}
                {...RoleColors}
              >
                <ListRoleButtonText role={role} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={context} />
    </>
  );
}

export const useRolesContext = useOutletContext<SerializeFrom<typeof loader>>;
