import { ActionButton } from "~/components/interactivity/action-button";
import {
  ListFilterInfo,
  ListFilterInfoProps,
} from "~/components/interactivity/list-filter-info";
import {
  MemoryFilteredList,
  MemoryFilteredListProps,
} from "~/components/logic/memory-filtered-list";
import {
  InteractiveList,
  InteractiveListProps,
} from "~/components/panel-structures/interactive-list";

type SidebarFilterControlledListProps<T> = {
  handleListButtonClick: (entry: T) => void;
  detectListButtonActive: (entry: T) => boolean;
  listButtonTextFactory: (entry: T) => React.ReactNode;
} & Omit<InteractiveListProps, "children"> &
  ListFilterInfoProps &
  Omit<MemoryFilteredListProps<T>, "children">;

export const SidebarFilterControlledList = <T extends unknown>(
  props: SidebarFilterControlledListProps<T>
) => (
  <InteractiveList {...props}>
    <ListFilterInfo {...props} />
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
