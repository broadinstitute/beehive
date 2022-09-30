export interface ListFilterInfoProps {
  filterText: string;
}

export const ListFilterInfo: React.FunctionComponent<ListFilterInfoProps> = ({
  filterText,
}) => (
  <div className="w-[30vw] min-h-[3rem]  text-zinc-500 flex flex-col items-center justify-center">
    <p>
      {`Type in the form on the left${
        filterText ? `; currently filtering for "${filterText}"` : " to search"
      }`}
    </p>
  </div>
);
