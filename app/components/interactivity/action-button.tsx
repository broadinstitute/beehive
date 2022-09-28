export interface ActionButtonProps {
  type?: "submit" | "reset" | "button" | undefined;
  sizeClassName?: string;
  borderClassName?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  isActive?: boolean | undefined;
}

export const ActionButton: React.FunctionComponent<ActionButtonProps> = ({
  type,
  sizeClassName = "w-[30vw]",
  borderClassName,
  children,
  onClick,
  isActive = false,
}) => (
  <div className={`relative h-12 shrink-0 ${sizeClassName || ""}`}>
    <button
      type={type}
      className={`h-full w-full flex items-center rounded-2xl shadow-md hover:shadow-lg border-2 hover:border-4 ${
        (isActive && "border-r-[2rem] hover:border-r-[2rem]") || ""
      } motion-safe:transition-all duration-75 bg-white active:bg-zinc-50 focus-visible:outline-blue-500 ${borderClassName}`}
      onClick={onClick}
    >
      <div className="flex flex-row justify-start items-center absolute left-[1vw] text-xl font-medium">
        {children}
      </div>
    </button>
  </div>
);

export default ActionButton;
