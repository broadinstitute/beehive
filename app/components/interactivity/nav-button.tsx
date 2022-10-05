import { NavLink } from "@remix-run/react";

export interface NavButtonProps {
  to: string;
  sizeClassName?: string | undefined | boolean;
  borderClassName: string;
  children: React.ReactNode;
  disabled?: boolean | undefined;
}

export const NavButton: React.FunctionComponent<NavButtonProps> = ({
  to,
  sizeClassName = "w-[30vw]",
  borderClassName,
  children,
  disabled,
}) => (
  <div
    className={`relative h-12 shrink-0 ${sizeClassName} ${
      disabled ? "pointer-events-none" : ""
    }`}
  >
    <NavLink
      prefetch="intent"
      to={to}
      className={({ isActive }) =>
        `h-full w-full flex items-center rounded-2xl shadow-md hover:shadow-lg border-2 hover:border-4 hover:border-r-[2rem] ${
          (isActive && "border-r-[2rem]") || ""
        } motion-safe:transition-all duration-75 bg-white active:bg-zinc-50 focus-visible:outline-blue-500 ${
          disabled ? "border-zinc-300" : borderClassName
        }`
      }
    >
      <div
        className={`flex flex-row justify-start items-center absolute left-[1vw] text-xl font-medium ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {children}
      </div>
    </NavLink>
  </div>
);