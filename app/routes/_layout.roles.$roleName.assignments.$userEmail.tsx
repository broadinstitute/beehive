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
  useOutletContext,
  useParams,
} from "@remix-run/react";
import {
  RolesApi,
  SherlockRoleAssignmentV3,
  SherlockUserV3,
} from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { RoleAssignmentDetails } from "~/features/sherlock/role-assignments/view/role-assignment-details";
import { RoleColors } from "~/features/sherlock/roles/role-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";
import { useRoleContext } from "./_layout.roles.$roleName";
export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/roles/${params.roleName}/assignments/${params.userEmail}`}>
      {params.userEmail}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.userEmail} - Role Assignment` },
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
  const params = useParams();
  const context = useRoleContext();
  const { role, selfUser, selfUserIsSuperAdmin } = context;

  const assignment = (role.assignments || []).find(
    (a) => (a.userInfo as SherlockUserV3).email == params.userEmail,
  );
  if (assignment === undefined) {
    throw new Error(
      "Could not find assignment for user " +
        params.userEmail +
        " in role " +
        role.name,
    );
  }
  const user = assignment.userInfo as SherlockUserV3;

  const assignmentEditableBySelfUser =
    selfUserIsSuperAdmin ||
    (user.email === selfUser.email && !!role.canBeGlassBrokenByRole);

  return (
    <>
      <OutsetPanel {...RoleColors}>
        <ItemDetails
          subtitle={`${
            assignment.expiresAt ? "Break-glass" : "Permanent"
          } Assignment`}
          title={user.name || user.email?.split("@")[0] || ""}
        >
          <RoleAssignmentDetails
            role={role}
            assignment={assignment}
            assignmentEditableBySelfUser={assignmentEditableBySelfUser}
            toEdit={"./edit"}
            toDelete={"./delete"}
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet
        context={{ user, assignment, assignmentEditableBySelfUser, ...context }}
      />
    </>
  );
}

export const useRoleAssignmentContext = useOutletContext<
  {
    user: SerializeFrom<SherlockUserV3>;
    assignment: SerializeFrom<SherlockRoleAssignmentV3>;
    assignmentEditableBySelfUser: boolean;
  } & ReturnType<typeof useRoleContext>
>;
