import type { SerializeFrom } from "@remix-run/node";
import type { SherlockRoleV3 } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { MutateControls } from "../../mutate-controls";
import { RoleColors } from "../role-colors";

export interface RoleDetailsProps {
  role: SherlockRoleV3 | SerializeFrom<SherlockRoleV3>;
  toAssignments?: string;
  toEdit?: string;
  toDelete?: string;
}

export const RoleDetails: React.FunctionComponent<RoleDetailsProps> = ({
  role,
  toAssignments,
  toEdit,
  toDelete,
}) => {
  const breakGlassRole = role.canBeGlassBrokenByRole
    ? (role.canBeGlassBrokenByRoleInfo as SherlockRoleV3)
    : undefined;

  return (
    <div className="flex flex-col space-y-4">
      {toAssignments && (
        <NavButton to={toAssignments} {...RoleColors}>
          <h2>View Assignments in This Role</h2>
        </NavButton>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Role Assignments
      </h2>
      {breakGlassRole ? (
        <div className="flex flex-col space-y-4">
          <p>
            Users in the{` `}
            <a
              href={`/roles/${breakGlassRole.name}`}
              className="underline decoration-color-link-underline"
              target="_blank"
              rel="noreferrer"
            >
              {breakGlassRole.name}
            </a>
            {` `}role can break glass into this role.
          </p>
          <h3 className="font-light text-xl text-color-header-text mt-2">
            Default Breakglass Duration
          </h3>
          {role.defaultGlassBreakDuration ? (
            <p>{role.defaultGlassBreakDuration}</p>
          ) : (
            <p>
              <span className="font-extralight">None</span>
            </p>
          )}
        </div>
      ) : (
        <p>Assignments in this role are granted by Sherlock super admins.</p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Azure Group
      </h2>
      {role.grantsDevAzureGroup ? (
        <p>
          Users in this role will be added to the{" "}
          <span className="font-medium">{role.grantsDevAzureGroup}</span> Azure
          group.
        </p>
      ) : (
        <p>
          <span className="font-extralight">None</span>
        </p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Firecloud Group
      </h2>
      {role.grantsDevFirecloudGroup ? (
        <p>
          Users in this role will be added to the{" "}
          <span className="font-medium">{role.grantsDevFirecloudGroup}</span>{" "}
          Google group.
        </p>
      ) : (
        <p>
          <span className="font-extralight">None</span>
        </p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Suitability
      </h2>
      {role.suspendNonSuitableUsers ? (
        <p>
          Unsuitable users in this role will be{" "}
          <span className="font-semibold">automatically suspended</span>.
        </p>
      ) : (
        <p>Suitability does not impact assignments in this role.</p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Sherlock Super Admin
      </h2>
      {role.grantsSherlockSuperAdmin ? (
        <p>
          This role grants{" "}
          <span className="font-medium">Sherlock super admin</span> privileges.
        </p>
      ) : (
        <p>This role does not grant Sherlock admin privileges.</p>
      )}
      {(toEdit || toDelete) && (
        <MutateControls
          name={role.name || ""}
          colors={RoleColors}
          toEdit={toEdit}
          toDelete={toDelete}
        />
      )}
    </div>
  );
};
