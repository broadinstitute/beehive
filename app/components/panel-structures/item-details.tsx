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
  <div className="w-screen lg:w-[33vw] flex flex-col space-y-4 p-8 pt-4 text-color-body-text">
    <div>
      <h2 className="text-2xl font-light text-color-header-text">{subtitle}</h2>
      <h1 className="text-5xl font-medium text-color-header-text">{title}</h1>
    </div>
    {children}
  </div>
);
