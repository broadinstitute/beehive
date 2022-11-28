import { AlertCircle } from "lucide-react";
import React from "react";
import { NavButton } from "../interactivity/nav-button";

export interface DataTypeColors {
  borderClassName: string;
  beforeBorderClassName: string;
  backgroundClassName: string;
}

export const ProdWarning: React.FunctionComponent<{ name: string }> = ({
  name,
}) => (
  <div className="p-6 rounded-2xl border-2 border-color-neutral-hard-border">
    <div className="flex flex-row items-center space-x-2 mb-2">
      <AlertCircle />
      <span className="grow font-medium text-lg text-color-header-text">
        Production
      </span>
    </div>
    <p>
      This part of Beehive can directly affect production so we've switched up
      the theme to help folks not change {name} by accident. Carry on!
    </p>
  </div>
);

export interface MutateControlsProps {
  name: string;
  colors: DataTypeColors;
  toChangeVersions?: string;
  changeVersionText?: string;
  toEdit?: string;
  toDelete?: string;
}

export const MutateControls: React.FunctionComponent<MutateControlsProps> = ({
  name,
  colors,
  toChangeVersions,
  changeVersionText,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-12">
    {toChangeVersions && (
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-light text-color-header-text">
          On-Demand Deployment
        </h2>
        <NavButton to={toChangeVersions} sizeClassName="w-[29vw]" {...colors}>
          Change Versions
        </NavButton>
        {changeVersionText && <p>{changeVersionText}</p>}
      </div>
    )}
    {(toEdit || toDelete) && (
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-light text-color-header-text">
          Make Changes
        </h2>
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
