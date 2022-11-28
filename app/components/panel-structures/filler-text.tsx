import React from "react";

export interface FillerTextProps {
  children?: React.ReactNode;
  title?: string;
}

export const FillerText: React.FunctionComponent<FillerTextProps> = ({
  title,
  children,
}) => (
  <div className="text-color-body-text h-full flex flex-col justify-center items-center text-center space-y-2 p-8">
    {title && (
      <h1 className=" text-color-header-text text-5xl font-medium">{title}</h1>
    )}
    {children}
  </div>
);
