import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockRoleAssignmentV3,
  SherlockRoleV3,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { RoleColors } from "../../roles/role-colors";
import { isRoleAssignmentExpired } from "../list/is-expired-or-suspended";

export interface RoleAssignmentEditableFieldsProps {
  role: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>;
  assignment:
    | SherlockRoleAssignmentV3
    | SerializeFrom<SherlockRoleAssignmentV3>;
  selfUserIsSuperAdmin: boolean;
  creating?: boolean;
}

export const roleAssignmentEditableFormDataToObject = function (
  formData: FormData,
): SherlockRoleAssignmentV3 {
  return {
    suspended: formData.get("suspended") === "true",
    expiresIn:
      formData.get("expires") === "false"
        ? undefined
        : formData.get("newExpiresIn")?.toString() || undefined,
  };
};

export const RoleAssignmentEditableFields: React.FunctionComponent<
  RoleAssignmentEditableFieldsProps
> = ({ role, assignment, selfUserIsSuperAdmin, creating }) => {
  const [roleAssignmentSuspended, setRoleAssignmentSuspended] = useState(
    assignment.suspended ? "true" : "false",
  );

  const [roleAssignmentExpires, setRoleAssignmentExpires] = useState(
    selfUserIsSuperAdmin ? (assignment.expiresIn ? "true" : "false") : "true",
  );

  const [roleAssignmentNewExpiresIn, setRoleAssignmentNewExpiresIn] = useState(
    creating ? role.defaultGlassBreakDuration || "" : "",
  );

  return (
    <div className="flex flex-col space-y-4">
      {selfUserIsSuperAdmin && (
        <div>
          <h2 className="font-light text-2xl text-color-header-text">
            Suspended
          </h2>
          <p>Configure whether the assignment is suspended.</p>
          <EnumInputSelect
            name="suspended"
            className="grid grid-cols-2 mt-2"
            fieldValue={roleAssignmentSuspended}
            setFieldValue={setRoleAssignmentSuspended}
            enums={[
              ["Yes", "true"],
              ["No", "false"],
            ]}
            {...RoleColors}
          />
        </div>
      )}
      {selfUserIsSuperAdmin && (
        <div>
          <h2 className="font-light text-2xl text-color-header-text">Expiry</h2>
          <p>Expire role assignment after a period of time.</p>
          <EnumInputSelect
            name="expires"
            className="grid grid-cols-2 mt-2"
            fieldValue={roleAssignmentExpires}
            setFieldValue={setRoleAssignmentExpires}
            enums={[
              ["Yes", "true"],
              ["No", "false"],
            ]}
            {...RoleColors}
          />
        </div>
      )}
      {roleAssignmentExpires === "true" && (
        <label>
          <h2 className="font-light text-2xl text-color-header-text">
            Set Expiration
          </h2>
          {assignment.expiresAt && (
            <div className="flex flex-col space-y-2">
              <p>
                This assignment{` `}
                <span className="font-medium">
                  {isRoleAssignmentExpired(assignment)
                    ? "expired"
                    : "will expire"}
                </span>
                {` `}on <PrettyPrintTime time={assignment.expiresAt} />.
              </p>
              <p>You can optionally change the expiration period here:</p>
            </div>
          )}
          <TextField
            name="newExpiresIn"
            value={roleAssignmentNewExpiresIn}
            placeholder="eg. 8h0m"
            required={roleAssignmentExpires === "true" && !assignment.expiresAt}
            onChange={(e) => {
              setRoleAssignmentNewExpiresIn(e.currentTarget.value);
            }}
          />
        </label>
      )}
    </div>
  );
};
