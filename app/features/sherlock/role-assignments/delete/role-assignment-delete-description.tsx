import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockRoleAssignmentV3,
  SherlockRoleV3,
  SherlockUserV3,
} from "@sherlock-js-client/sherlock";
import { isRoleAssignmentExpired } from "../list/is-expired-or-suspended";

export interface RoleAssignmentDeleteDescriptionProps {
  role: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>;
  user: SherlockUserV3 | SerializeFrom<SherlockUserV3>;
  assignment:
    | SherlockRoleAssignmentV3
    | SerializeFrom<SherlockRoleAssignmentV3>;
}

export const RoleAssignmentDeleteDescription: React.FunctionComponent<
  RoleAssignmentDeleteDescriptionProps
> = ({ role, user, assignment }) => (
  <div className="flex flex-col space-y-4">
    <h2 className="text-2xl font-light">
      Are you sure you want to delete this role assignment?
    </h2>
    <p>
      This will delete the{" "}
      {assignment.suspended
        ? "suspended"
        : isRoleAssignmentExpired(assignment)
          ? "expired"
          : "active"}{" "}
      {role.name} role assignment for{" "}
      <span className="font-medium">{user.email}</span>.
    </p>
    {(role.grantsDevAzureGroup || role.grantsDevFirecloudGroup) && (
      <p>
        User will be removed from
        {role.grantsDevAzureGroup && (
          <span>
            {` `}the {role.grantsDevAzureGroup} Azure group
          </span>
        )}
        {role.grantsDevAzureGroup && role.grantsDevFirecloudGroup && (
          <span>{` `}and</span>
        )}
        {role.grantsDevFirecloudGroup && (
          <span>
            {` `}the {role.grantsDevFirecloudGroup} firecloud.org Google group
          </span>
        )}
        .
      </p>
    )}
    {role.grantsSherlockSuperAdmin && (
      <p>User will lose Sherock Super Admin privileges.</p>
    )}
  </div>
);
