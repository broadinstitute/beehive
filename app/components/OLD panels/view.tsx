import { FunctionComponent, ReactNode } from "react";

interface ViewPanelProps {
  title?: string;
  subtitle?: string;
  borderClassName: string;
  children: ReactNode;
}

const ViewPanel: FunctionComponent<ViewPanelProps> = ({
  title,
  subtitle,
  borderClassName,
  children,
}) => (
  <div
    className={`w-[33vw] shrink-0 bg-white shadow-lg p-8 pt-4 h-full border-l-4 overflow-y-auto overflow-x-hidden flex flex-col space-y-4 ${borderClassName}`}
  >
    <div>
      <h2 className="text-xl font-light">{subtitle}</h2>
      <h1 className="text-5xl font-medium">{title}</h1>
    </div>
    {children}
  </div>
);

export default ViewPanel;
