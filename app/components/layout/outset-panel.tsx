import { InsetPanelProps } from "./inset-panel";

export interface OutsetPanelProps extends InsetPanelProps {
  borderClassName?: string;
}

export const OutsetPanel: React.FunctionComponent<OutsetPanelProps> = ({
  children,
  borderClassName,
  doubleWidth,
  largeScreenOnly,
}) => (
  <div
    className={`snap-end w-screen lg:w-min ${
      doubleWidth ? "lg:min-w-[66vw]" : "lg:min-w-[33vw]"
    } ${
      largeScreenOnly ? "hidden lg:block" : ""
    } shrink-0 h-full relative bg-color-near-bg ${
      borderClassName ? `border-l-4 ${borderClassName}` : ""
    }`}
  >
    <div className="w-full h-full absolute shadow-xl -z-10"></div>
    <div className="h-full overflow-y-auto overflow-x-clip">{children}</div>
  </div>
);
