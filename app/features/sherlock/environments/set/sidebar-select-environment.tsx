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
  title?: string;
  extraTextGenerator?: (
    entry: SerializeFrom<V2controllersEnvironment>
  ) => string | undefined;
}> = ({
  environments,
  fieldValue,
  setFieldValue,
  title = "Select Environment",
  extraTextGenerator,
}) => (
  <SidebarFilterControlledList
    title={title}
    entries={environments}
    filterText={fieldValue}
    filter={matchEnvironment}
    handleListButtonClick={(entry) => setFieldValue(entry.name || "")}
    detectListButtonActive={(entry) => entry.name === fieldValue}
    listButtonTextFactory={
      extraTextGenerator
        ? (entry) => (
            <ListEnvironmentButtonText
              environment={entry}
              extraText={extraTextGenerator(entry)}
            />
          )
        : (entry) => <ListEnvironmentButtonText environment={entry} />
    }
    {...EnvironmentColors}
  />
);
