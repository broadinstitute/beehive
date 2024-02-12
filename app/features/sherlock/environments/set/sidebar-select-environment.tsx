import type { SerializeFrom } from "@remix-run/node";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { EnvironmentColors } from "../environment-colors";
import { ListEnvironmentButtonText } from "../list/list-environment-button-text";
import { matchEnvironment } from "../list/match-environment";

export const SidebarSelectEnvironment: React.FunctionComponent<{
  environments: SerializeFrom<SherlockEnvironmentV3[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
  title?: string;
  extraTextGenerator?: (
    entry: SerializeFrom<SherlockEnvironmentV3>,
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
