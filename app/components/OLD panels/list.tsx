import { ReactNode, useState } from "react";
import LineNavButton from "~/components/common/line-nav-button";

interface ListPanelProps<T> {
  title: string;
  entries: Array<T>;
  to: (entry: T) => string;
  filter: (entry: T, filter: string) => Boolean | undefined;
  children: (entry: T) => ReactNode;
  borderClassName: string;
  toCreateNew?: string | undefined;
}

const ListPanel = <T extends unknown>({
  title,
  entries,
  to,
  filter,
  children,
  borderClassName,
  toCreateNew,
}: ListPanelProps<T>) => {
  const [filterText, setFilterText] = useState("");
  const entryButtons = entries
    .map(
      (entry, index) =>
        (filterText === "" || filter(entry, filterText) || false) && (
          <LineNavButton
            to={to(entry)}
            key={index.toString()}
            sizeClassName="w-[30vw]"
            borderClassName={borderClassName}
          >
            {children(entry)}
          </LineNavButton>
        )
    )
    // We actually *do* the filtering earlier because the indexes stay constant, which prevents
    // re-rendering. This gets the list size in order so we can switch based on it to show something
    // nice when there's nothing in the list.
    .filter((value) => value !== false);
  return (
    <div className="w-[33vw] shrink-0 overflow-auto flex flex-col items-center space-y-4 pb-4">
      <div
        className={` w-[30vw] bg-white rounded-2xl rounded-t-none border-2 border-t-0 p-3 pt-4 shadow-md ${borderClassName}`}
      >
        <h1 className="text-3xl font-medium">{title}</h1>
      </div>
      <div className="w-[30vw] flex flex-row-reverse">
        {toCreateNew && (
          <LineNavButton
            to={toCreateNew}
            borderClassName={borderClassName}
            sizeClassName="w-[12vw] ml-4"
          >
            <h2 className="font-medium">Create New</h2>
          </LineNavButton>
        )}
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-2xl h-12 border border-zinc-400 focus-visible:outline-blue-500 pl-[1vw] bg-transparent placeholder:text-zinc-500"
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {entryButtons.length > 0 ? (
        entryButtons
      ) : (
        <div>{`(There's nothing here${
          filterText === "" ? "" : `, matching "${filterText}"`
        })`}</div>
      )}
    </div>
  );
};

export default ListPanel;
