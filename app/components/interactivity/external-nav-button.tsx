import type { ComponentProps } from "react";
import type { NavButtonProps } from "./nav-button";

export const ExternalNavButton: React.FunctionComponent<
  NavButtonProps & Pick<ComponentProps<"a">, "target">
> = ({
  to,
  beforeBorderClassName,
  textAlignment = "text-left",
  icon,
  children,
  disabled,
  prod,
  target,
}) => (
  <div
    data-theme-prod={prod}
    className={`grow min-w-min relative shrink-0 ${
      disabled ? "pointer-events-none" : ""
    }`}
  >
    <a
      href={to}
      className={`flex flex-row items-center bg-color-nearest-bg active:bg-color-button-down rounded-2xl min-h-[3rem] ${"w-full"} focus-visible:outline focus-visible:outline-color-focused-element before:w-full before:h-full before:block before:absolute before:rounded-2xl before:border-2 before:hover:border-4 shadow-md hover:shadow-lg ${
        disabled
          ? "before:border-color-neutral-soft-border"
          : beforeBorderClassName
      } motion-safe:transition-all before:motion-safe:transition-all`}
      target={target}
    >
      <div
        className={`shrink-0 flex flex-row gap-2 justify-between items-center h-full w-full pl-4 pr-16 py-2 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {icon}
        <div
          className={`grow text-xl font-medium text-color-body-text ${textAlignment}`}
        >
          {children}
        </div>
      </div>
    </a>
  </div>
);
