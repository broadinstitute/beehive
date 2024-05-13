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
import { RolesApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { getFakeRoles } from "~/features/sherlock/roles/fake/fake-data";
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
  return getFakeRoles();

  // TODO - for use when API is ready
  return new RolesApi(SherlockConfiguration)
    .apiRolesV3Get({}, handleIAP(request))
    .then((roles) => roles.sort(roleSorter), errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const roles = useLoaderData<typeof loader>();
  const { roleName: currentPathRole } = useParams();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList title="Roles" {...RoleColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate="./new"
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
      <Outlet context={{ roles }} />
    </>
  );
}

export const useRolesContext = useOutletContext<{
  roles: SerializeFrom<typeof loader>;
}>;
