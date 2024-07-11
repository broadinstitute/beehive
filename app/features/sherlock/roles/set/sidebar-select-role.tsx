import type { SerializeFrom } from "@remix-run/node";
import type { SherlockRoleV3 } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { ListRoleButtonText } from "../list/list-role-button-text";
import { matchRole } from "../list/match-role";
import { RoleColors } from "../role-colors";

export const SidebarSelectRole: React.FunctionComponent<{
  roles: SerializeFrom<SherlockRoleV3[]>;
  fieldValue: string;
  setFieldValue: (value: SerializeFrom<SherlockRoleV3> | undefined) => void;
  title?: string;
}> = ({ roles, fieldValue, setFieldValue, title = "Select Role" }) => (
  <SidebarFilterControlledList
    title={title}
    entries={roles}
    filterText={fieldValue}
    filter={matchRole}
    handleListButtonClick={(entry) => setFieldValue(entry)}
    detectListButtonActive={(entry) => entry.name === fieldValue}
    listButtonTextFactory={(entry) => <ListRoleButtonText role={entry} />}
    {...RoleColors}
  />
);
