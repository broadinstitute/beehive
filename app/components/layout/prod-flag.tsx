import React from "react";

export const ProdFlag: React.FunctionComponent<{
  prod?: boolean;
  children: React.ReactNode;
}> = ({ prod, children }) => (
  <div
    data-theme-prod={prod}
    className="flex flex-row h-full grow bg-color-far-bg"
  >
    {children}
  </div>
);
