import { Link } from "@remix-run/react";
import { NavButtonProps } from "./nav-button";

// Like NavButton but never shows as active. Useful to navigate between URL parameters, since those aren't taken into account to
// determine what is active or not by Remix or React Router.
export const InactiveNavButton: React.FunctionComponent<NavButtonProps> = ({
  to,
  beforeBorderClassName,
  textAlignment = "text-left",
  children,
  disabled,
  prod,
}) => (
  <div
    data-theme-prod={prod}
    className={`grow min-w-min relative shrink-0 ${
      disabled ? "pointer-events-none" : ""
    }`}
  >
    <Link
      prefetch="intent"
      to={to}
      className={`flex flex-row items-center bg-color-nearest-bg active:bg-color-button-down rounded-2xl min-h-[3rem] ${"w-full"} focus-visible:outline focus-visible:outline-color-focused-element before:w-full before:h-full before:block before:absolute before:rounded-2xl before:border-2 before:hover:border-4 shadow-md hover:shadow-lg ${
        disabled
          ? "before:border-color-neutral-soft-border"
          : beforeBorderClassName
      } motion-safe:transition-all before:motion-safe:transition-all`}
    >
      <div
        className={`shrink-0 flex flex-row justify-between items-center h-full w-full pl-4 pr-16 py-2 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <div
          className={`grow text-xl font-medium text-color-header-text ${textAlignment}`}
        >
          {children}
        </div>
      </div>
    </Link>
  </div>
);
