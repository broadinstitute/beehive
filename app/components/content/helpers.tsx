import React from "react";
import { NavButton } from "../interactivity/nav-button";

export interface DataTypeColors {
  borderClassName: string;
  backgroundClassName: string;
}

export interface MutateControlsProps {
  name: string;
  colors: DataTypeColors;
  toChangeVersions?: string | undefined;
  toEdit?: string | undefined;
  toDelete?: string | undefined;
}

export const MutateControls: React.FunctionComponent<MutateControlsProps> = ({
  name,
  colors,
  toChangeVersions,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-4">
    <h2 className="text-2xl font-light">Change {name}</h2>
    {toChangeVersions && (
      <NavButton to={toChangeVersions} sizeClassName="w-[29vw]" {...colors}>
        Change Versions
      </NavButton>
    )}
    {toEdit && (
      <NavButton to={toEdit} sizeClassName="w-[29vw]" {...colors}>
        Edit
      </NavButton>
    )}
    {toDelete && (
      <NavButton to={toDelete} sizeClassName="w-[29vw]" {...colors}>
        Delete
      </NavButton>
    )}
  </div>
);
