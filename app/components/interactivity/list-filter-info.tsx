import { PanelSize, panelSizeToInnerClassName } from "~/helpers/panel-size";

export interface ListFilterInfoProps {
  size?: PanelSize;
  filterText: string;
}

export const ListFilterInfo: React.FunctionComponent<ListFilterInfoProps> = ({
  size = "one-third",
  filterText,
}) => (
  <div
    className={`${panelSizeToInnerClassName(
      size
    )} min-h-[3rem] text-color-placeholder-text flex flex-col items-center justify-center`}
  >
    <p className="text-center">
      {`Type in the form on the left${
        filterText ? `; currently filtering for "${filterText}"` : " to search"
      }`}
    </p>
  </div>
);
