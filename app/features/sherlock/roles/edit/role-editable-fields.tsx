import type { SerializeFrom } from "@remix-run/node";
import type { SherlockRoleV3 } from "@sherlock-js-client/sherlock";
import { useEffect, useRef, useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import type { SetsSidebarProps } from "~/hooks/use-sidebar";
import { RoleColors } from "../role-colors";
import { SidebarSelectRole } from "../set/sidebar-select-role";

export interface RoleEditableFieldsProps {
  role?: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>;
  roles: SerializeFrom<SherlockRoleV3[]>;
  breakGlassRole: SerializeFrom<SherlockRoleV3> | undefined;
  setBreakGlassRole: React.Dispatch<
    React.SetStateAction<SerializeFrom<SherlockRoleV3> | undefined>
  >;
}

export const roleEditableFormDataToObject = function (
  formData: FormData,
): SherlockRoleV3 {
  return {
    ...formDataToObject(formData, true),
    grantsSherlockSuperAdmin:
      formData.get("grantsSherlockSuperAdmin") === "true",
    suspendNonSuitableUsers: formData.get("suspendNonSuitableUsers") === "true",
    canBeGlassBrokenByRole:
      parseInt(formData.get("canBeGlassBrokenByRole")?.toString() || "") ||
      undefined,
    grantsDevAzureGroup: formData.get("grantsDevAzureGroup")?.toString() || "",
    grantsDevFirecloudGroup:
      formData.get("grantsDevFirecloudGroup")?.toString() || "",
  };
};

export const RoleEditableFields: React.FunctionComponent<
  RoleEditableFieldsProps & SetsSidebarProps
> = ({
  setSidebarFilterText,
  setSidebar,

  role,
  roles,
  breakGlassRole,
  setBreakGlassRole,
}) => {
  const [name, setName] = useState(role?.name || "");

  const [breakGlassRoleInputText, setBreakGlassRoleInputText] = useState(
    breakGlassRole?.name || "",
  );

  const [breakGlassEnabled, setBreakGlassEnabled] = useState(
    role?.canBeGlassBrokenByRole ? "true" : "false",
  );
  const [grantsSherlockSuperAdmin, setGrantsSherlockSuperAdmin] = useState(
    role?.grantsSherlockSuperAdmin
      ? role?.grantsSherlockSuperAdmin.toString()
      : "false",
  );
  const [suspendNonSuitableUsers, setSuspendNonSuitableUsers] = useState(
    role?.suspendNonSuitableUsers
      ? role?.suspendNonSuitableUsers.toString()
      : "false",
  );

  const breakGlassRoleInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    breakGlassRoleInputRef.current?.setCustomValidity(
      breakGlassEnabled && roles.find((r) => r.name === breakGlassRoleInputText)
        ? ""
        : "A valid break-glass role is required",
    );
  }, [breakGlassRoleInputText]);

  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl text-color-header-text">Name</h2>
        <p>The name of the role.</p>
        <TextField
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
          }}
          required={true}
        />
      </label>
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Break Glass
        </h2>
        <p>
          Allow users in a specific role to{" "}
          <b className="font-semibold">break glass</b> in to this role (i.e.
          request a temporary assignment to this role).
        </p>
        <EnumInputSelect
          name="breakGlassEnabled"
          className="grid grid-cols-2 mt-2"
          fieldValue={breakGlassEnabled}
          setFieldValue={setBreakGlassEnabled}
          enums={[
            ["Yes", "true"],
            ["No", "false"],
          ]}
          {...RoleColors}
        />
      </div>
      {breakGlassEnabled === "true" && (
        <label>
          <h2 className="font-light text-2xl text-color-header-text">
            Permission Role
          </h2>
          <p>
            Users with assignments in the permission role will be able to
            request a temporary assignment in this role.
          </p>
          <TextField
            name="canBeGlassBrokenByRoleName"
            ref={breakGlassRoleInputRef}
            placeholder="Search..."
            required={breakGlassEnabled === "true"}
            value={breakGlassRoleInputText}
            onChange={(e) => {
              setBreakGlassRoleInputText(e.currentTarget.value);
              setSidebarFilterText(e.currentTarget.value);
              const matchingRole = roles.find(
                (r) => r.name === e.currentTarget.value,
              );
              setBreakGlassRole(matchingRole);
            }}
            onFocus={() => {
              setSidebar(({ filterText }) => (
                <SidebarSelectRole
                  roles={roles}
                  fieldValue={filterText}
                  setFieldValue={(role) => {
                    setBreakGlassRole(role);
                    setBreakGlassRoleInputText(role?.name || "");
                    setSidebar();
                  }}
                  title="Select Role"
                />
              ));
            }}
          />
          <input
            type="hidden"
            name="canBeGlassBrokenByRole"
            value={breakGlassRole?.id}
          />
        </label>
      )}
      {breakGlassEnabled === "true" && (
        <label>
          <h2 className="font-light text-2xl text-color-header-text">
            Default Break Glass Duration
          </h2>
          <p>Default duration for a break glass assignment in this role.</p>
          <TextField
            name="defaultGlassBreakDuration"
            defaultValue={role?.defaultGlassBreakDuration || "8h0m"}
            required={breakGlassEnabled === "true"}
            pattern="(\d+h)?(\d+m)?(\d+s)?"
          />
        </label>
      )}
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Azure Group
        </h2>
        <p>Grants users in this role access to the named Azure group.</p>
        <TextField
          name="grantsDevAzureGroup"
          defaultValue={role?.grantsDevAzureGroup}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Firecloud Group
        </h2>
        <p>
          Grants users in this role access to the named firecloud.org group.
        </p>
        <TextField
          name="grantsDevFirecloudGroup"
          defaultValue={role?.grantsDevFirecloudGroup}
        />
      </label>
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Grants Sherlock super admin?
        </h2>
        <p>
          Assignments in this role grant Sherlock super admin privileges,
          including the ability to edit roles and assignments.
        </p>
        <EnumInputSelect
          name="grantsSherlockSuperAdmin"
          className="grid grid-cols-2 mt-2"
          fieldValue={grantsSherlockSuperAdmin}
          setFieldValue={setGrantsSherlockSuperAdmin}
          enums={[
            ["Yes", "true"],
            ["No", "false"],
          ]}
          {...RoleColors}
        />
      </div>
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Suspend non-suitable users?
        </h2>
        <p>Users that are not suitable will be suspended from the role.</p>
        <EnumInputSelect
          name="suspendNonSuitableUsers"
          className="grid grid-cols-2 mt-2"
          fieldValue={suspendNonSuitableUsers}
          setFieldValue={setSuspendNonSuitableUsers}
          enums={[
            ["Yes", "true"],
            ["No", "false"],
          ]}
          {...RoleColors}
        />
      </div>
    </div>
  );
};
