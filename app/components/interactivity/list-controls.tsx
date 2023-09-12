import type { PanelSize } from "~/helpers/panel-size";
import { panelSizeToInnerClassName } from "~/helpers/panel-size";
import { NavButton } from "./nav-button";

export interface ListControlsProps {
  size?: PanelSize;
  filterText?: string;
  setFilterText: React.Dispatch<React.SetStateAction<string>>;
  beforeBorderClassName: string;
  toCreateText?: string;
  toCreate?: string;
}

export const ListControls: React.FunctionComponent<ListControlsProps> = ({
  size = "one-third",
  filterText,
  setFilterText,
  beforeBorderClassName,
  toCreateText = "Create New",
  toCreate,
}) => (
  <div
    className={`${panelSizeToInnerClassName(
      size,
    )} flex flex-row-reverse gap-4 flex-wrap`}
  >
    {toCreate && (
      <NavButton
        to={toCreate}
        beforeBorderClassName={beforeBorderClassName}
        grow
      >
        {toCreateText}
      </NavButton>
    )}
    <input
      type="text"
      placeholder="Search..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      className="grow h-12 pl-4 bg-transparent rounded-2xl text-color-body-text placeholder:text-color-placeholder-text border border-color-text-box-border focus-visible:outline focus-visible:outline-color-focused-element"
    />
  </div>
);
