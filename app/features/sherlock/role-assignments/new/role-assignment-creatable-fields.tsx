import type { SerializeFrom } from "@remix-run/node";
import type { SherlockUserV3 } from "@sherlock-js-client/sherlock";
import { TextField } from "~/components/interactivity/text-field";
import { SetsSidebarProps } from "~/hooks/use-sidebar";
import { SidebarSelectUser } from "../../users/set/sidebar-select-user";

export interface RoleAssignmentCreatableFieldsProps {
  user: string | undefined;
  setUser: React.Dispatch<React.SetStateAction<string | undefined>>;
  users: SerializeFrom<Array<SherlockUserV3>>;
  selfUserEmail?: string;
  selfUserIsSuperAdmin: boolean;
}

export const RoleAssignmentCreatableFields: React.FunctionComponent<
  RoleAssignmentCreatableFieldsProps & SetsSidebarProps
> = ({
  user,
  setUser,
  users,
  selfUserEmail,
  selfUserIsSuperAdmin,

  setSidebarFilterText,
  setSidebar,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl text-color-header-text">User</h2>
        {selfUserIsSuperAdmin ? (
          <TextField
            name="user"
            disabled={!selfUserIsSuperAdmin}
            placeholder="Search..."
            value={user || ""}
            onChange={(e) => {
              setUser(e.currentTarget.value);
              setSidebarFilterText(e.currentTarget.value);
            }}
            onFocus={() => {
              setSidebar(({ filterText }) => (
                <SidebarSelectUser
                  users={users}
                  fieldValue={filterText}
                  selfEmail={selfUserEmail || ""}
                  setFieldValue={(value) => {
                    setUser(value);
                    setSidebar();
                  }}
                />
              ));
            }}
          />
        ) : (
          <>
            <span className="pt-2 text-lg">{selfUserEmail}</span>
            <input name="user" type="hidden" value={selfUserEmail} />
          </>
        )}
      </label>
    </div>
  );
};
