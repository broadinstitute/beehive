import { AlertCircle } from "lucide-react";

export const ProdWarning: React.FunctionComponent<{ name: string }> = ({
  name,
}) => (
  <div className="p-6 rounded-2xl border-2 border-color-neutral-hard-border">
    <div className="flex flex-row items-center space-x-2 mb-2">
      <AlertCircle />
      <span className="grow font-medium text-lg text-color-header-text">
        Production
      </span>
    </div>
    <p>
      This part of Beehive can directly affect production so we've switched up
      the theme to help folks not change {name} by accident. Carry on!
    </p>
  </div>
);
