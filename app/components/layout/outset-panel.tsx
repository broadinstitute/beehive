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
    className={`w-[33vw] shrink-0 h-full relative bg-white ${
      borderClassName ? `border-l-4 ${borderClassName}` : ""
    }`}
  >
    <div className="w-full h-full absolute shadow-lg -z-10"></div>
    <div className="overflow-y-auto overflow-x-clip">{children}</div>
  </div>
);

export const DoubleOutsetPanel: React.FunctionComponent<OutsetPanelProps> = ({
  children,
  borderClassName,
}) => (
  <div
    className={`w-[66vw] shrink-0 h-full bg-white ${
      borderClassName ? `border-l-4 ${borderClassName}` : ""
    }`}
  >
    <div className="w-full h-full absolute shadow-lg -z-10"></div>
    <div className="overflow-y-auto overflow-x-clip">{children}</div>
  </div>
);
