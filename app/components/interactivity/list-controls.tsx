import { NavButton } from "./nav-button";

export interface ListControlsProps {
  filterText?: string;
  setFilterText: React.Dispatch<React.SetStateAction<string>>;
  beforeBorderClassName: string;
  toCreateText?: string;
  toCreate?: string;
  doubleWidth?: boolean;
}

export const ListControls: React.FunctionComponent<ListControlsProps> = ({
  filterText,
  setFilterText,
  beforeBorderClassName,
  toCreateText = "Create New",
  toCreate,
  doubleWidth,
}) => (
  <div
    className={`${
      doubleWidth ? "w-[60vw]" : "w-[30vw]"
    } flex flex-row-reverse gap-4`}
  >
    {toCreate && (
      <NavButton
        to={toCreate}
        beforeBorderClassName={beforeBorderClassName}
        sizeClassName="w-[12vw]"
      >
        {toCreateText}
      </NavButton>
    )}
    <input
      type="text"
      placeholder="Search..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      className="w-full h-12 pl-[1vw] bg-transparent rounded-2xl text-color-body-text placeholder:text-color-placeholder-text border border-color-text-box-border focus-visible:outline focus-visible:outline-color-focused-element"
    />
  </div>
);
