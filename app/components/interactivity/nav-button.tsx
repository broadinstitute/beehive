import { NavLink } from "@remix-run/react";

export interface NavButtonProps {
  to: string;
  sizeClassName?: string | boolean;
  beforeBorderClassName: string;
  textAlignment?: string;
  children: React.ReactNode;
  disabled?: boolean;
  prod?: boolean;
}

export const NavButton: React.FunctionComponent<NavButtonProps> = ({
  to,
  sizeClassName = "w-[30vw]",
  beforeBorderClassName,
  textAlignment = "text-left",
  children,
  disabled,
  prod,
}) => (
  <div
    data-theme-prod={prod}
    className={`min-w-min relative shrink-0 ${
      disabled ? "pointer-events-none" : ""
    }`}
  >
    <NavLink
      prefetch="intent"
      to={to}
      className={({ isActive }) =>
        `flex flex-row items-center bg-color-nearest-bg active:bg-color-button-down rounded-2xl min-h-[3rem] ${
          sizeClassName || "w-full"
        } focus-visible:outline focus-visible:outline-color-focused-element before:w-full before:h-full before:block before:absolute before:rounded-2xl ${
          isActive
            ? "before:border-r-[2rem] before:hover:border-r-[2rem]"
            : "before:hover:border-r-[2rem]"
        } before:border-2 before:hover:border-4 shadow-md hover:shadow-lg ${
          disabled
            ? "before:border-color-neutral-soft-border"
            : beforeBorderClassName
        } motion-safe:transition-all before:motion-safe:transition-all`
      }
    >
      <div
        className={`shrink-0 flex flex-row justify-between items-center h-full w-full px-[1rem] py-2 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <div
          className={`grow text-xl font-medium text-color-body-text ${textAlignment}`}
        >
          {children}
        </div>
      </div>
    </NavLink>
  </div>
);
