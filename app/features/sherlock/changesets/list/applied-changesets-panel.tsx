import { SerializeFrom } from "@remix-run/node";
import { V2controllersChangeset } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListPaginationControls } from "~/components/interactivity/list-pagination-controls";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { ColorProps } from "~/features/color-class-names";
import { ChangesetEntry } from "./changeset-entry";
import { matchChangeset } from "./match-changeset";

export const AppliedChangesetsPanel: React.FunctionComponent<{
  changesets: SerializeFrom<V2controllersChangeset[]>;
  offset: number;
  limit: number;
  colors: ColorProps;
}> = ({ changesets, offset, limit, colors }) => {
  const [filterText, setFilterText] = useState("");
  return (
    <InsetPanel doubleWidth>
      <InteractiveList title="Version History" doubleWidth {...colors}>
        <ListPaginationControls
          filterText={filterText}
          setFilterText={setFilterText}
          offset={offset}
          limit={limit}
          currentCount={changesets.length}
          doubleWidth
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
              disableTitle={true}
              fadeIfUnappliable={false}
              startMinimized={true}
            />
          )}
        </MemoryFilteredList>
        {changesets.length > 3 && (
          <ListPaginationControls
            filterText={filterText}
            setFilterText={setFilterText}
            offset={offset}
            limit={limit}
            currentCount={changesets.length}
            doubleWidth
            {...colors}
          />
        )}
      </InteractiveList>
    </InsetPanel>
  );
};
