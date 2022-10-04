export interface ItemDetailsProps {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}

export const ItemDetails: React.FunctionComponent<ItemDetailsProps> = ({
  children,
  subtitle,
  title,
}) => (
  <div className="w-[33vw] h-full flex flex-col space-y-4 p-8 pt-4">
    <div>
      <h2 className="text-2xl font-light">{subtitle}</h2>
      <h1 className="text-5xl font-medium">{title}</h1>
    </div>
    {children}
  </div>
);
