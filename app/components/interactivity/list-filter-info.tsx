export interface ListFilterInfoProps {
  filterText: string;
}

export const ListFilterInfo: React.FunctionComponent<ListFilterInfoProps> = ({
  filterText,
}) => (
  <div className="w-[90vw] lg:w-[30vw] min-h-[3rem]  text-color-placeholder-text flex flex-col items-center justify-center">
    <p className="text-center">
      {`Type in the form on the left${
        filterText ? `; currently filtering for "${filterText}"` : " to search"
      }`}
    </p>
  </div>
);
