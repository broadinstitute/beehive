import type { PanelSize } from "~/helpers/panel-size";
import { panelSizeToOuterClassName } from "~/helpers/panel-size";

export type InsetPanelProps = {
  children: React.ReactNode;
  largeScreenOnly?: boolean;
  alwaysShowScrollbar?: boolean;
  size?: PanelSize;
};

export const InsetPanel: React.FunctionComponent<InsetPanelProps> = ({
  children,
  largeScreenOnly,
  alwaysShowScrollbar,
  size = "one-third",
}) => (
  <div
    className={`snap-end ${panelSizeToOuterClassName(size)} ${
      largeScreenOnly ? "hidden laptop:block" : ""
    } shrink-0 h-full bg-color-far-bg ${
      alwaysShowScrollbar ? "overflow-y-scroll" : "overflow-y-auto"
    } overflow-x-clip`}
  >
    {children}
  </div>
);
