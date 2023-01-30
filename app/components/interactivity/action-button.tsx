import { BeehiveIcon } from "../assets/beehive-icon";

export interface ActionButtonProps {
  type?: "submit" | "reset" | "button";
  sizeClassName?: string;
  beforeBorderClassName?: string;
  textAlignment?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
  isLoading?: boolean;
  activeOnHover?: boolean;
  prod?: boolean;
}

export const ActionButton: React.FunctionComponent<ActionButtonProps> = ({
  type,
  sizeClassName = "w-[90vw] lg:w-[30vw]",
  beforeBorderClassName,
  textAlignment = "text-left",
  children,
  onClick,
  isActive = false,
  isLoading = false,
  activeOnHover = false,
  prod,
}) => (
  <div data-theme-prod={prod} className="relative shrink-0">
    <button
      type={type}
      className={`flex flex-row items-center bg-color-nearest-bg active:bg-color-button-down rounded-2xl min-h-[3rem] ${
        sizeClassName || "w-full"
      } focus-visible:outline focus-visible:outline-color-focused-element before:w-full before:h-full before:block before:absolute before:rounded-2xl ${
        isActive ? "before:border-r-[2rem] before:hover:border-r-[2rem]" : ""
      } ${activeOnHover ? "before:hover:border-r-[2rem]" : ""} ${
        isLoading
          ? "before:border-4 shadow-lg"
          : "before:border-2 before:hover:border-4 shadow-md hover:shadow-lg"
      } ${beforeBorderClassName} motion-safe:transition-all before:motion-safe:transition-all`}
      onClick={onClick}
      disabled={isLoading}
    >
      <div className="shrink-0 flex flex-row justify-between items-center h-full w-full px-[1rem] py-2">
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
);
