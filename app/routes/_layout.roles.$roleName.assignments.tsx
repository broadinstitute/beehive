import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, Outlet, useParams } from "@remix-run/react";
import type { SherlockUserV3 } from "@sherlock-js-client/sherlock";
import { UsersApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ListRoleAssignmentUserButtonText } from "~/features/sherlock/role-assignments/list/list-role-assignment-user-button-text";
import { matchRoleAssignmentByUser } from "~/features/sherlock/role-assignments/list/match-role-assignment-by-user";
import { makeRoleAssignmentSorterForUser } from "~/features/sherlock/role-assignments/list/role-assignment-sorter";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { useRoleContext } from "./_layout.roles.$roleName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/roles/${params.roleName}/assignments`}>Assignments</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.roleName} - Role Assignments`,
  },
];

export const ErrorBoundary = PanelErrorBoundary;

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new UsersApi(SherlockConfiguration)
    .apiUsersV3SelectorGet({ selector: "self" }, handleIAP(request))
    .catch(errorResponseThrower);
}

export default function Route() {
  const context = useRoleContext();
  const { role, roleAssignableBySelfUser } = context;

  const params = useParams();
  const [filterText, setFilterText] = useState("");

  const sortedAssignments = (role.assignments || []).sort(
    makeRoleAssignmentSorterForUser(context.selfUser.email),
  );

  return (
    <>
      <InsetPanel alwaysShowScrollbar>
        <InteractiveList
          title={`Assignments in ${params.roleName}`}
          {...RoleColors}
        >
          <ListControls
            setFilterText={setFilterText}
            toCreate={roleAssignableBySelfUser ? "./new" : undefined}
            toCreateText={roleAssignableBySelfUser ? "Add New" : undefined}
            {...RoleColors}
          />
          <MemoryFilteredList
            entries={sortedAssignments}
            filterText={filterText}
            filter={matchRoleAssignmentByUser}
          >
            {(roleAssn, index) => (
              <NavButton
                to={`./${(roleAssn.userInfo as SherlockUserV3).email}`}
                key={index.toString()}
                {...RoleColors}
              >
                <ListRoleAssignmentUserButtonText roleAssn={roleAssn} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={context} />
    </>
  );
}
