import { ActionButtonProps } from "../interactivity/action-button";
import { NavButtonProps } from "../interactivity/nav-button";

export interface MemoryFilteredListProps<T> {
  entries: Array<T>;
  filterText?: string;
  filter?: (entry: T, filterText: string) => boolean | undefined;
  children: (
    entry: T,
    index: number
  ) => React.ReactElement<NavButtonProps | ActionButtonProps>;
}

export const MemoryFilteredList = <T extends unknown>({
  entries,
  filterText,
  filter,
  children,
}: MemoryFilteredListProps<T>) => {
  const entryButtons = entries
    .map(
      (entry, index) =>
        (filterText === undefined ||
          filter === undefined ||
          filterText === "" ||
          filter(entry, filterText) ||
          false) &&
        children(entry, index)
    )
    // We actually *do* the filtering in the map so that the indexes stay constant--this avoids
    // re-rendering and improves the animations a bit. The `false` values wouldn't get rendered
    // but stripping them out here gets the list size in order so we can switch on it below.
    .filter((value) => value !== false);
  if (entryButtons.length > 0) {
    return <div className="flex flex-col space-y-4">{entryButtons}</div>;
  } else if (
    filterText === undefined ||
    filter === undefined ||
    filterText === ""
  ) {
    return <div>{`(There's nothing here)`}</div>;
  } else {
    return <div>{`(There's nothing here matching ${filterText})`}</div>;
  }
};
