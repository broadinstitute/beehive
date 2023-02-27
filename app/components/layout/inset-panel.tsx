export type InsetPanelProps = {
  children: React.ReactNode;
  doubleWidth?: boolean;
  largeScreenOnly?: boolean;
  alwaysShowScrollbar?: boolean;
};

export const InsetPanel: React.FunctionComponent<InsetPanelProps> = ({
  children,
  doubleWidth,
  largeScreenOnly,
  alwaysShowScrollbar,
}) => (
  <div
    className={`snap-end w-screen ${
      doubleWidth ? "xl:w-min xl:min-w-[66vw]" : "xl:w-[33vw]"
    } ${
      largeScreenOnly ? "hidden xl:block" : ""
    } shrink-0 h-full bg-color-far-bg ${
      alwaysShowScrollbar ? "overflow-y-scroll" : "overflow-y-auto"
    } overflow-x-clip`}
  >
    {children}
  </div>
);
