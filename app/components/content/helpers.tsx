import React from "react";
import { NavButton } from "../interactivity/nav-button";

export interface DataTypeColors {
  borderClassName: string;
  backgroundClassName: string;
}

export interface MutateControlsProps {
  name: string;
  colors: DataTypeColors;
  toChangeVersions?: string;
  toEdit?: string;
  toDelete?: string;
}

export const MutateControls: React.FunctionComponent<MutateControlsProps> = ({
  name,
  colors,
  toChangeVersions,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-12">
    {toChangeVersions && (
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-light">On-Demand Deployment</h2>
        <NavButton to={toChangeVersions} sizeClassName="w-[29vw]" {...colors}>
          Change Versions
        </NavButton>
      </div>
    )}
    {(toEdit || toDelete) && (
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-light">Make Changes</h2>
        {toEdit && (
          <NavButton to={toEdit} sizeClassName="w-[29vw]" {...colors}>
            Edit Metadata
          </NavButton>
        )}
        {toDelete && (
          <NavButton to={toDelete} sizeClassName="w-[29vw]" {...colors}>
            Delete
          </NavButton>
        )}
      </div>
    )}
  </div>
);
