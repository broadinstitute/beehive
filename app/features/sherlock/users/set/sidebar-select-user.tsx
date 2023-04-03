import { SerializeFrom } from "@remix-run/node";
import { V2controllersUser } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { ListUserButtonText } from "../list/list-user-button-text";
import { matchUser } from "../list/matchUser";
import { UserColors } from "../user-colors";

export const SidebarSelectUser: React.FunctionComponent<{
  users: SerializeFrom<V2controllersUser[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
  title?: string;
  selfEmail?: string;
}> = ({
  users,
  fieldValue,
  setFieldValue,
  title = "Select User",
  selfEmail,
}) => (
  <SidebarFilterControlledList
    title={title}
    entries={users}
    filterText={fieldValue}
    filter={matchUser}
    handleListButtonClick={(entry) => setFieldValue(entry.email || "")}
    detectListButtonActive={(entry) => entry.email === fieldValue}
    listButtonTextFactory={(entry) => (
      <ListUserButtonText user={entry} selfEmail={selfEmail} />
    )}
    {...UserColors}
  />
);
