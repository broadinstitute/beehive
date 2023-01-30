import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { EnvironmentColors } from "../environment-colors";
import { ListEnvironmentButtonText } from "../list/list-environment-button-text";
import { matchEnvironment } from "../list/match-environment";

export const SidebarSelectEnvironment: React.FunctionComponent<{
  environments: SerializeFrom<V2controllersEnvironment[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
}> = ({ environments, fieldValue, setFieldValue }) => (
  <SidebarFilterControlledList
    title="Select Environment"
    entries={environments}
    filterText={fieldValue}
    filter={matchEnvironment}
    handleListButtonClick={(entry) => setFieldValue(entry.name || "")}
    detectListButtonActive={(entry) => entry.name === fieldValue}
    listButtonTextFactory={(entry) => (
      <ListEnvironmentButtonText environment={entry} />
    )}
    {...EnvironmentColors}
  />
);
