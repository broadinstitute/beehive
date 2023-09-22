import { ActionButton } from "~/components/interactivity/action-button";
import type { ListControlsProps } from "~/components/interactivity/list-controls";
import { ListControls } from "~/components/interactivity/list-controls";
import type { MemoryFilteredListProps } from "~/components/logic/memory-filtered-list";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import type { InteractiveListProps } from "~/components/panel-structures/interactive-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";

type SidebarFilterListProps<T> = {
  leadingButtons?: React.ReactNode;
  handleListButtonClick: (entry: T) => void;
  detectListButtonActive: (entry: T) => boolean;
  listButtonTextFactory: (entry: T) => React.ReactNode;
} & Omit<InteractiveListProps, "children"> &
  ListControlsProps &
  Omit<MemoryFilteredListProps<T>, "children">;

export const SidebarFilterList = <T,>(props: SidebarFilterListProps<T>) => (
  <InteractiveList {...props}>
    {props.leadingButtons}
    <ListControls {...props} />
    <MemoryFilteredList {...props}>
      {(entry, index) => (
        <ActionButton
          key={index}
          onClick={() => props.handleListButtonClick(entry)}
          isActive={props.detectListButtonActive(entry)}
          {...props}
        >
          {props.listButtonTextFactory(entry)}
        </ActionButton>
      )}
    </MemoryFilteredList>
  </InteractiveList>
);
