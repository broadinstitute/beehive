import type { PanelSize } from "~/helpers/panel-size";
import { panelSizeToInnerClassName } from "~/helpers/panel-size";
import { InactiveNavButton } from "./inactive-nav-button";

export const ListPaginationControls: React.FunctionComponent<{
  size?: PanelSize;
  filterText?: string;
  setFilterText: React.Dispatch<React.SetStateAction<string>>;
  beforeBorderClassName: string;
  offset: number;
  limit: number;
  currentCount: number;
}> = ({
  size = "one-third",
  filterText,
  setFilterText,
  beforeBorderClassName,
  offset,
  limit,
  currentCount,
}) => (
  <div
    className={`${panelSizeToInnerClassName(
      size,
    )} flex flex-row gap-4 flex-wrap laptop:flex-nowrap`}
  >
    {offset > 0 && (
      <InactiveNavButton
        to={`./?offset=${Math.max(0, offset - limit)}`}
        beforeBorderClassName={beforeBorderClassName}
        grow
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
        grow
      >
        Next Page
      </InactiveNavButton>
    )}
  </div>
);
