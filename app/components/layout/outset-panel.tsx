import { InsetPanelProps } from "./inset-panel";

export interface OutsetPanelProps extends InsetPanelProps {
  borderClassName?: string;
}

export const OutsetPanel: React.FunctionComponent<OutsetPanelProps> = ({
  children,
  borderClassName,
  doubleWidth,
  largeScreenOnly,
  alwaysShowScrollbar,
}) => (
  <div
    className={`snap-end w-screen ${
      doubleWidth ? "xl:w-[66vw]" : "xl:w-[33vw]"
    } ${
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
