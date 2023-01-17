import { InactiveNavButton } from "./inactive-nav-button";

export const ListPaginationControls: React.FunctionComponent<{
  filterText?: string;
  setFilterText: React.Dispatch<React.SetStateAction<string>>;
  beforeBorderClassName: string;
  offset: number;
  limit: number;
  currentCount: number;
  doubleWidth?: boolean;
}> = ({
  filterText,
  setFilterText,
  beforeBorderClassName,
  offset,
  limit,
  currentCount,
  doubleWidth = false,
}) => (
  <div
    className={`w-[90vw] ${
      doubleWidth ? "lg:w-[60vw]" : "lg:w-[30vw]"
    } flex flex-row gap-4 flex-wrap lg:flex-nowrap`}
  >
    {offset > 0 && (
      <InactiveNavButton
        to={`./?offset=${Math.max(0, offset - limit)}`}
        beforeBorderClassName={beforeBorderClassName}
      >
        Previous Page
      </InactiveNavButton>
    )}
    <input
      type="text"
      placeholder="Search..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      className="grow h-12 pl-4 bg-transparent rounded-2xl text-color-body-text placeholder:text-color-placeholder-text border border-color-text-box-border focus-visible:outline focus-visible:outline-color-focused-element"
    />
    {currentCount === limit && (
      <InactiveNavButton
        to={`./?offset=${offset + limit}`}
        beforeBorderClassName={beforeBorderClassName}
      >
        Next Page
      </InactiveNavButton>
    )}
  </div>
);
