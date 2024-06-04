import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockRoleAssignmentV3,
  SherlockRoleV3,
} from "@sherlock-js-client/sherlock";
import { AlertTriangle, BadgeCheck } from "lucide-react";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { MutateControls } from "../../mutate-controls";
import { RoleColors } from "../../roles/role-colors";
import { isRoleAssignmentExpired } from "../list/is-expired-or-suspended";

export interface RoleAssignmentDetailsProps {
  assignment:
    | SherlockRoleAssignmentV3
    | SerializeFrom<SherlockRoleAssignmentV3>;
  role: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>;
  assignmentEditableBySelfUser: boolean;
  toEdit: string;
  toDelete: string;
}

export const RoleAssignmentDetails: React.FunctionComponent<
  RoleAssignmentDetailsProps
> = ({ assignment, assignmentEditableBySelfUser, toEdit, toDelete }) => {
  const isExpired = isRoleAssignmentExpired(assignment);
  return (
    <div className="flex flex-col space-y-4">
      {assignment.suspended || isExpired ? (
        <div className="flex flex-row space-x-2">
          <h2 className="font-light text-2xl text-color-header-text">
            {assignment.suspended ? "Suspended" : "Expired"}
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
          <span className="font-medium">suspended</span>.
          {assignmentEditableBySelfUser && (
            <span>
              {` `}Check user suitability or click "Edit Metadata" to enable
              user.
            </span>
          )}
        </p>
      )}
      {isExpired && (
        <p>
          This assignment <span className="font-medium">expired</span> on{" "}
          <PrettyPrintTime time={assignment.expiresAt} />.
          {assignmentEditableBySelfUser && (
            <span>
              {` `}Click "Edit Metadata" to reset the expiration period.
            </span>
          )}
        </p>
      )}
      {!(assignment.suspended || isExpired) && (
        <p>
          This assignment is <span className="font-medium">active</span>.
        </p>
      )}
      {!isExpired && (
        <>
          <h2 className="font-light text-2xl text-color-header-text">Expiry</h2>
          {assignment.expiresAt ? (
            <p>
              This assignment <span className="font-medium">will expire</span>{" "}
              on <PrettyPrintTime time={assignment.expiresAt} />.
            </p>
          ) : (
            <span className="font-extralight">None</span>
          )}
        </>
      )}
      {assignmentEditableBySelfUser && (
        <MutateControls
          colors={RoleColors}
          toEdit={toEdit}
          toDelete={toDelete}
        />
      )}
    </div>
  );
};
