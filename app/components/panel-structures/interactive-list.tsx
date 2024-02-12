import type { PanelSize } from "~/helpers/panel-size";
import { panelSizeToInnerClassName } from "~/helpers/panel-size";

export interface InteractiveListProps {
  size?: PanelSize;
  children: React.ReactNode;
  title: React.ReactNode;
  borderClassName: string;
}

export const InteractiveList: React.FunctionComponent<InteractiveListProps> = ({
  size = "one-third",
  children,
  title,
  borderClassName,
}) => (
  <div className="min-h-full flex flex-col items-center pb-4">
    <div
      className={`grow flex flex-col space-y-4 ${panelSizeToInnerClassName(
        size,
      )}`}
    >
      <div
        className={`w-full bg-color-nearest-bg p-3 pt-4 shadow-md rounded-2xl rounded-t-none border-2 border-t-0 ${borderClassName}`}
      >
        <h1 className="text-color-header-text text-3xl font-medium">{title}</h1>
      </div>
      {children}
    </div>
  </div>
);
