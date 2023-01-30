export type InsetPanelProps = {
  children: React.ReactNode;
  doubleWidth?: boolean;
  largeScreenOnly?: boolean;
};

export const InsetPanel: React.FunctionComponent<InsetPanelProps> = ({
  children,
  doubleWidth,
  largeScreenOnly,
}) => (
  <div
    className={`w-screen ${
      doubleWidth ? "lg:w-min lg:min-w-[66vw]" : "lg:w-[33vw]"
    } ${
      largeScreenOnly ? "hidden lg:block" : ""
    } shrink-0 h-full bg-color-far-bg overflow-y-auto overflow-x-clip`}
  >
    {children}
  </div>
);

/**
 * @deprecated
 */
export const DoubleInsetPanel: React.FunctionComponent<InsetPanelProps> = ({
  children,
}) => (
  <div className="w-screen lg:w-fit lg:min-w-[66vw] grow shrink-0 h-full overflow-y-auto overflow-x-clip">
    {children}
  </div>
);
