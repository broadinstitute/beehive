import type { SerializeFrom } from "@remix-run/node";
import type { SherlockRoleV3 } from "@sherlock-js-client/sherlock";
import { isRoleAssignmentExpiredOrSuspended } from "../../role-assignments/list/is-expired-or-suspended";

export interface RoleDeleteDescriptionProps {
  role: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>;
}

export const RoleDeleteDescription: React.FunctionComponent<
  RoleDeleteDescriptionProps
> = ({ role }) => (
  <div className="flex flex-col space-y-4">
    <h2 className="text-2xl font-light">
      Are you sure you want to delete this role?
    </h2>
    <p>
      This will delete the role and its{" "}
      {
        (role.assignments || []).filter(isRoleAssignmentExpiredOrSuspended)
          .length
      }{" "}
      active assignments.
    </p>
    {(role.grantsDevAzureGroup || role.grantsDevFirecloudGroup) && (
      <p>
        All Sherlock-provisioned group memberships in{` `}
        {role.grantsDevAzureGroup && (
          <span>
            the {role.grantsDevAzureGroup} Azure group{` `}
          </span>
        )}
        {role.grantsDevAzureGroup && role.grantsDevFirecloudGroup && (
          <span>and{` `}</span>
        )}
        {role.grantsDevFirecloudGroup && (
          <span>
            the {role.grantsDevFirecloudGroup} firecloud.org Google group{` `}
          </span>
        )}
        will be removed.
      </p>
    )}
  </div>
);
