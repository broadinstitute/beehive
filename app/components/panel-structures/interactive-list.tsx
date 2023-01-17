export interface InteractiveListProps {
  children: React.ReactNode;
  title: string;
  borderClassName: string;
  doubleWidth?: boolean;
}

export const InteractiveList: React.FunctionComponent<InteractiveListProps> = ({
  children,
  title,
  borderClassName,
  doubleWidth,
}) => (
  <div className="flex flex-col items-center pb-4">
    <div
      className={`flex flex-col space-y-4 w-[90vw] ${
        doubleWidth ? "lg:w-[60vw]" : "lg:w-[30vw]"
      }`}
    >
      <div
        className={`w-[90vw] ${
          doubleWidth ? "lg:w-[60vw]" : "lg:w-[30vw]"
        } bg-color-nearest-bg p-3 pt-4 shadow-md rounded-2xl rounded-t-none border-2 border-t-0 ${borderClassName}`}
      >
        <h1 className="text-color-header-text text-3xl font-medium">{title}</h1>
      </div>
      {children}
    </div>
  </div>
);
