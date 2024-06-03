import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockRoleAssignmentV3,
  SherlockRoleV3,
} from "@sherlock-js-client/sherlock";
import { AlertTriangle, BadgeCheck } from "lucide-react";
import { MutateControls } from "../../mutate-controls";
import { RoleColors } from "../../roles/role-colors";
import { isRoleAssignmentExpired } from "../list/is-expired-or-suspended";

export interface RoleAssignmentDetailsProps {
  assignment:
    | SherlockRoleAssignmentV3
    | SerializeFrom<SherlockRoleAssignmentV3>;
  role: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>;
  toEdit?: string;
  toDelete?: string;
}

export const RoleAssignmentDetails: React.FunctionComponent<
  RoleAssignmentDetailsProps
> = ({ assignment, toEdit, toDelete }) => {
  const isExpired = isRoleAssignmentExpired(assignment);
  return (
    <div className="flex flex-col space-y-4">
      {assignment.suspended || isExpired ? (
        <div className="flex flex-row space-x-2">
          <h2 className="font-light text-2xl text-color-header-text">
            Inactive
          </h2>
          <AlertTriangle className="stroke-color-status-yellow shrink-0 h-8 w-8" />
        </div>
      ) : (
        <div className="flex flex-row space-x-2">
          <h2 className="font-light text-2xl text-color-header-text">Active</h2>
          <BadgeCheck className="stroke-color-status-green shrink-0 h-8 w-8" />
        </div>
      )}
      {assignment.suspended && (
        <p>
          This assignment has been{" "}
          <span className="font-medium">suspended</span>. Please check user
          suitability.
        </p>
      )}
      {isExpired && (
        <p>
          This assignment has <span className="font-medium">expired</span>.
          Please check expiration.
        </p>
      )}
      {!(assignment.suspended || isExpired) && (
        <p>
          This assignment is <span className="font-medium">active</span>.
        </p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">Expiry</h2>
      {assignment.expiresAt ? (
        <p>
          This assignment{" "}
          <span className="font-medium">
            {isExpired ? "expired" : "will expire"}
          </span>{" "}
          at{" "}
          <span className="font-medium">
            {assignment.expiresAt.toString() || ""}
          </span>
        </p>
      ) : (
        <p>
          <span className="font-extralight">None</span>
        </p>
      )}
      {(toEdit || toDelete) && (
        <MutateControls
          colors={RoleColors}
          toEdit={toEdit}
          toDelete={toDelete}
        />
      )}
    </div>
  );
};
