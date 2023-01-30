import { ActionButton } from "~/components/interactivity/action-button";
import {
  ListControls,
  ListControlsProps,
} from "~/components/interactivity/list-controls";
import {
  MemoryFilteredList,
  MemoryFilteredListProps,
} from "~/components/logic/memory-filtered-list";
import {
  InteractiveList,
  InteractiveListProps,
} from "~/components/panel-structures/interactive-list";

type SidebarFilterListProps<T> = {
  handleListButtonClick: (entry: T) => void;
  detectListButtonActive: (entry: T) => boolean;
  listButtonTextFactory: (entry: T) => React.ReactNode;
} & Omit<InteractiveListProps, "children"> &
  ListControlsProps &
  Omit<MemoryFilteredListProps<T>, "children">;

export const SidebarFilterList = <T extends unknown>(
  props: SidebarFilterListProps<T>
) => (
  <InteractiveList {...props}>
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
