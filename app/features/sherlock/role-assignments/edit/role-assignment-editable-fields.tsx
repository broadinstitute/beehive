import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockRoleAssignmentV3,
  SherlockRoleV3,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { RoleColors } from "../../roles/role-colors";

export interface RoleAssignmentEditableFieldsProps {
  role: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>;
  assignment:
    | SherlockRoleAssignmentV3
    | SerializeFrom<SherlockRoleAssignmentV3>;
  selfUserIsSuperAdmin: boolean;
}

export const roleAssignmentEditableFormDataToObject = function (
  formData: FormData,
): SherlockRoleAssignmentV3 {
  return {
    suspended: formData.get("suspended") === "true",
    expiresIn:
      formData.get("expires") === "true"
        ? formData.get("expiresIn")?.toString()
        : undefined,
  };
};

export const RoleAssignmentEditableFields: React.FunctionComponent<
  RoleAssignmentEditableFieldsProps
> = ({ role, assignment, selfUserIsSuperAdmin }) => {
  const [roleAssignmentSuspended, setRoleAssignmentSuspended] = useState(
    assignment.suspended ? "true" : "false",
  );

  const [roleAssignmentExpires, setRoleAssignmentExpires] = useState(
    assignment.expiresIn ? "true" : "false",
  );

  const [roleAssignmentExpiresIn, setRoleAssignmentExpiresIn] = useState(
    assignment.expiresIn || role.defaultGlassBreakDuration || "",
  );

  return (
    <div className="flex flex-col space-y-4">
      {selfUserIsSuperAdmin && (
        <div>
          <h2 className="font-light text-2xl text-color-header-text">
            Suspended
          </h2>
          <p>Configure whether the assigment is suspended.</p>
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
            Duration
          </h2>
          <p>
            Configure a time period after which this role assignment will
            expire.
          </p>
          <TextField
            name="expiresIn"
            value={roleAssignmentExpiresIn}
            placeholder="eg. 8h0m"
            required={roleAssignmentExpires === "true"}
            onChange={(e) => {
              setRoleAssignmentExpiresIn(e.currentTarget.value);
            }}
          />
        </label>
      )}
    </div>
  );
};
