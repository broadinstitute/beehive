import { panelSizeToOuterClassName } from "~/helpers/panel-size";
import { InsetPanelProps } from "./inset-panel";

export interface OutsetPanelProps extends InsetPanelProps {
  borderClassName?: string;
}

export const OutsetPanel: React.FunctionComponent<OutsetPanelProps> = ({
  children,
  borderClassName,
  largeScreenOnly,
  alwaysShowScrollbar,
  size = "one-third",
}) => (
  <div
    className={`snap-end w-screen ${panelSizeToOuterClassName(size)} ${
      largeScreenOnly ? "hidden xl:block" : ""
    } shrink-0 h-full relative bg-color-near-bg ${
      borderClassName ? `border-l-4 ${borderClassName}` : ""
    }`}
  >
    <div className="w-full h-full absolute shadow-xl -z-10"></div>
    <div
      className={`h-full ${
        alwaysShowScrollbar ? "overflow-y-scroll" : "overflow-y-auto"
      } overflow-x-clip`}
    >
      {children}
    </div>
  </div>
);
