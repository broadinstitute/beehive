import { forwardRef } from "react";
import { PanelSize, panelSizeToInnerClassName } from "~/helpers/panel-size";
import { BeehiveIcon } from "../assets/beehive-icon";

export interface ActionButtonProps {
  type?: "submit" | "reset" | "button";
  size?: PanelSize;
  sizeClassName?: string;
  beforeBorderClassName?: string;
  textAlignment?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
  isHovered?: boolean;
  isLoading?: boolean;
  activeOnHover?: boolean;
  prod?: boolean;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      type,
      size = "one-third",
      sizeClassName,
      beforeBorderClassName,
      textAlignment = "text-left",
      children,
      icon,
      onClick,
      isActive = false,
      isHovered = false,
      isLoading = false,
      activeOnHover = false,
      prod,
    },
    ref
  ) => (
    <div data-theme-prod={prod} className="relative shrink-0">
      <button
        ref={ref}
        type={type}
        className={`flex flex-row items-center bg-color-nearest-bg active:bg-color-button-down rounded-2xl min-h-[3rem] ${
          sizeClassName || panelSizeToInnerClassName(size)
        } focus-visible:outline focus-visible:outline-color-focused-element before:w-full before:h-full before:block before:absolute before:rounded-2xl ${
          isActive ? "before:border-r-[2rem] before:hover:border-r-[2rem]" : ""
        } ${activeOnHover ? "before:hover:border-r-[2rem]" : ""} ${
          isLoading
            ? "before:border-4 shadow-lg"
            : `${
                isHovered ? "before:border-4" : "before:border-2"
              } before:hover:border-4 shadow-md hover:shadow-lg`
        } ${beforeBorderClassName} motion-safe:transition-all before:motion-safe:transition-all`}
        onClick={onClick}
        disabled={isLoading}
      >
        <div className="shrink-0 flex flex-row gap-2 justify-between items-center h-full w-full px-[1rem] py-2">
          {icon}
          <div
            className={`grow text-xl font-medium text-color-body-text ${textAlignment}`}
          >
            {children}
          </div>
          {isLoading ? (
            <BeehiveIcon className="h-7 w-7" loading />
          ) : isActive ? (
            <div className="h-7 w-7" />
          ) : null}
        </div>
      </button>
    </div>
  )
);
