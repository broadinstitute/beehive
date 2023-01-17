import { FillerTextProps } from "../panel-structures/filler-text";
import { InteractiveListProps } from "../panel-structures/interactive-list";

export interface InsetPanelProps {
  children: React.ReactElement<InteractiveListProps | FillerTextProps>;
}

export const InsetPanel: React.FunctionComponent<InsetPanelProps> = ({
  children,
}) => (
  <div className="w-screen lg:w-[33vw] shrink-0 h-full overflow-y-auto overflow-x-clip">
    {children}
  </div>
);

export const DoubleInsetPanel: React.FunctionComponent<InsetPanelProps> = ({
  children,
}) => (
  <div className="w-screen lg:w-fit lg:min-w-[66vw] grow shrink-0 h-full overflow-y-auto overflow-x-clip">
    {children}
  </div>
);
