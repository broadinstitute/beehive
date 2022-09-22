import { FillerTextProps } from "../panel-structures/filler-text";
import { InteractiveListProps } from "../panel-structures/interactive-list";

export interface InsetPanelProps {
  children: React.ReactElement<InteractiveListProps | FillerTextProps>;
}

export const InsetPanel: React.FunctionComponent<InsetPanelProps> = ({
  children,
}) => (
  <div className="w-[33vw] h-full overflow-y-auto overflow-x-clip">
    {children}
  </div>
);

export const DoubleInsetPanel: React.FunctionComponent<InsetPanelProps> = ({
  children,
}) => (
  <div className="w-[66vw] h-full overflow-y-auto overflow-x-clip">
    {children}
  </div>
);
