export interface ItemDetailsProps {
  children: React.ReactNode;
  subtitle?: string;
  title: string;
  icon?: React.ReactNode;
}

export const ItemDetails: React.FunctionComponent<ItemDetailsProps> = ({
  children,
  subtitle,
  title,
  icon,
}) => (
  <div className="flex flex-col space-y-4 p-8 pt-4 text-color-body-text">
    <div>
      {subtitle && (
        <h2 className="text-2xl font-light text-color-header-text">
          {subtitle}
        </h2>
      )}
      <div className="flex flex-row items-start gap-4 mt-1">
        {icon}
        <h1 className="text-5xl font-medium text-color-header-text pt-1">
          {title}
        </h1>
      </div>
    </div>
    {children}
  </div>
);
