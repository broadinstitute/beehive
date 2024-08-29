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
          <h2>View User Assignments in This Role</h2>
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
            <p>None.</p>
          )}
        </div>
      ) : (
        <p>Assignments in this role are granted by Sherlock super admins.</p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Suitability and Suspensions
      </h2>
      {role.suspendNonSuitableUsers ? (
        <p>
          Unsuitable users in this role will be{" "}
          <span className="font-semibold">automatically suspended</span>.
        </p>
      ) : (
        <p>
          Suitability does not directly impact assignments in this role.
          Suspensions are done manually by Sherlock super admins.
        </p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Broad Institute Group
      </h2>
      {role.grantsBroadInstituteGroup ? (
        <p>
          Users in this role will be added to{" "}
          <span className="font-medium">{role.grantsBroadInstituteGroup}</span>.
        </p>
      ) : (
        <p>None.</p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Dev Azure Group
      </h2>
      {role.grantsDevAzureGroup ? (
        <p>
          Users in this role will be added to{" "}
          <span className="font-medium">{role.grantsDevAzureGroup}</span> in the
          azure.dev.envs-terra.bio Azure tenant.
        </p>
      ) : (
        <p>None.</p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Prod Azure Group
      </h2>
      {role.grantsProdAzureGroup ? (
        <p>
          Users in this role will be added to{" "}
          <span className="font-medium">{role.grantsProdAzureGroup}</span> in
          the firecloud.org Azure tenant.
        </p>
      ) : (
        <p>None.</p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Dev Firecloud Group
      </h2>
      {role.grantsDevFirecloudGroup ? (
        <p>
          Users in this role will be added to{" "}
          <span className="font-medium">{role.grantsDevFirecloudGroup}</span>.
        </p>
      ) : (
        <p>None.</p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        QA Firecloud Group
      </h2>
      {role.grantsQaFirecloudGroup ? (
        <p>
          Users in this role will be added to{" "}
          <span className="font-medium">{role.grantsQaFirecloudGroup}</span>.
        </p>
      ) : (
        <p>None.</p>
      )}
      <h2 className="font-light text-2xl text-color-header-text">
        Prod Firecloud Group
      </h2>
      {role.grantsProdFirecloudGroup ? (
        <p>
          Users in this role will be added to{" "}
          <span className="font-medium">{role.grantsProdFirecloudGroup}</span>.
        </p>
      ) : (
        <p>None.</p>
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
