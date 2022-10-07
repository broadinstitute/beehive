import { BeehiveIcon } from "../assets/beehive-icon";

export interface ActionButtonProps {
  type?: "submit" | "reset" | "button";
  sizeClassName?: string;
  borderClassName?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
  isLoading?: boolean;
  activeOnHover?: boolean;
}

export const ActionButton: React.FunctionComponent<ActionButtonProps> = ({
  type,
  sizeClassName = "w-[30vw]",
  borderClassName,
  children,
  onClick,
  isActive = false,
  isLoading = false,
  activeOnHover = false,
}) => (
  <div className={`relative h-12 shrink-0 ${sizeClassName || ""}`}>
    <button
      type={type}
      className={`h-full w-full flex flex-row items-center rounded-2xl ${
        isActive ? "border-r-[2rem] hover:border-r-[2rem]" : ""
      } ${activeOnHover ? "hover:border-r-[2rem]" : ""} ${
        isLoading
          ? "border-4 shadow-lg"
          : "shadow-md hover:shadow-lg border-2 hover:border-4"
      } motion-safe:transition-all duration-75 bg-white active:bg-zinc-50 focus-visible:outline-blue-500 ${borderClassName}`}
      onClick={onClick}
      disabled={isLoading}
    >
      <div className="flex flex-row justify-start items-center absolute left-[1vw] text-xl font-medium">
        {children}
      </div>
      {isLoading && (
        <BeehiveIcon className="h-7 w-7 absolute right-[1vw]" loading />
      )}
    </button>
  </div>
);

export default ActionButton;
