import { ActionBoxProps } from "../panel-structures/action-box";
import { ItemDetailsProps } from "../panel-structures/item-details";

export interface OutsetPanelProps {
  children: React.ReactElement<ActionBoxProps | ItemDetailsProps>;
  borderClassName?: string | undefined;
}

export const OutsetPanel: React.FunctionComponent<OutsetPanelProps> = ({
  children,
  borderClassName,
}) => (
  <div
    className={`w-[33vw] h-full bg-white before:shadow-lg overflow-y-auto overflow-x-clip ${
      borderClassName ? `border-l-4 ${borderClassName}` : ""
    }`}
  >
    {children}
  </div>
);

export const DoubleOutsetPanel: React.FunctionComponent<OutsetPanelProps> = ({
  children,
  borderClassName,
}) => (
  <div
    className={`w-[66vw] h-full bg-white shadow-lg overflow-y-auto overflow-x-clip ${
      borderClassName ? `border-l-4 ${borderClassName}` : ""
    }`}
  >
    {children}
  </div>
);
