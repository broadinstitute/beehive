export interface InteractiveListProps {
  children: React.ReactNode;
  title: string;
  borderClassName: string;
}

export const InteractiveList: React.FunctionComponent<InteractiveListProps> = ({
  children,
  title,
  borderClassName,
}) => (
  <div className="flex flex-col items-center space-y-4 pb-4">
    <div
      className={`w-[30vw] bg-white p-3 pt-4 shadow-md rounded-2xl rounded-t-none border-2 border-t-0 ${borderClassName}`}
    >
      <h1 className="text-3xl font-medium">{title}</h1>
    </div>
    {children}
  </div>
);
