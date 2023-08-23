import { SerializeFrom } from "@remix-run/node";
import { V2controllersChangeset } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { ColorProps } from "~/features/color-class-names";
import { ChangesetEntry } from "./changeset-entry";
import { matchChangeset } from "./match-changeset";

export const DeploymentTimelinePanel: React.FunctionComponent<{
  changesets: SerializeFrom<V2controllersChangeset[]>;
  colors: ColorProps;
}> = ({ changesets, colors }) => {
  const [filterText, setFilterText] = useState("");
  return (
    <InsetPanel size="two-thirds">
      <InteractiveList
        title="Deployment Timeline"
        size="two-thirds"
        {...colors}
      >
        <ListControls
          filterText={filterText}
          setFilterText={setFilterText}
          size="two-thirds"
          {...colors}
        />
        <MemoryFilteredList
          filterText={filterText}
          entries={changesets}
          filter={matchChangeset}
        >
          {(changeset, index) => (
            <ChangesetEntry
              changeset={changeset}
              key={index}
              startMinimized={true}
            />
          )}
        </MemoryFilteredList>
      </InteractiveList>
    </InsetPanel>
  );
};
