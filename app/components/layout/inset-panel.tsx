import { PanelSize, panelSizeToOuterClassName } from "~/helpers/panel-size";

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
      largeScreenOnly ? "hidden xl:block" : ""
    } shrink-0 h-full bg-color-far-bg ${
      alwaysShowScrollbar ? "overflow-y-scroll" : "overflow-y-auto"
    } overflow-x-clip`}
  >
    {children}
  </div>
);
