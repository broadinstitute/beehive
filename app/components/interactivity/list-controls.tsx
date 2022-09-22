import { NavButton } from "./nav-button";

export interface ListControlsProps {
  setFilterText: React.Dispatch<React.SetStateAction<string>>;
  borderClassName: string;
  toCreate?: string | undefined;
}

export const ListControls: React.FunctionComponent<ListControlsProps> = ({
  setFilterText,
  borderClassName,
  toCreate,
}) => (
  <div className="w-[30vw] flex flex-row-reverse">
    {toCreate && (
      <NavButton
        to={toCreate}
        borderClassName={borderClassName}
        sizeClassName="w-[12vw] ml-4"
      >
        <h2 className="font-medium">Create New</h2>
      </NavButton>
    )}
    <input
      type="text"
      placeholder="Search..."
      onChange={(e) => setFilterText(e.target.value)}
      className="w-full h-12 pl-[1vw] bg-transparent rounded-2xl placeholder:text-zinc-500 border border-zinc-400 focus-visible:outline-blue-500"
    />
  </div>
);
