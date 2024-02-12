import { NavLink } from "@remix-run/react";
import type { RemixNavLinkProps } from "@remix-run/react/dist/components";

export interface NavButtonProps {
  to: string;
  beforeBorderClassName: string;
  textAlignment?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  disabled?: boolean;
  prod?: boolean;
  grow?: boolean;
  end?: boolean;
  forceActive?: boolean;
}

export const NavButton: React.FunctionComponent<
  NavButtonProps & Pick<RemixNavLinkProps, "prefetch">
> = ({
  to,
  beforeBorderClassName,
  textAlignment = "text-left",
  children,
  icon,
  onClick,
  disabled,
  prod,
  grow,
  end,
  forceActive,

  prefetch = "intent",
}) => (
  <div
    data-theme-prod={prod}
    className={`${grow ? "grow" : ""} relative shrink-0 ${
      disabled ? "pointer-events-none" : ""
    }`}
  >
    <NavLink
      prefetch={prefetch}
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex flex-row items-center bg-color-nearest-bg active:bg-color-button-down rounded-2xl min-h-[3rem] focus-visible:outline focus-visible:outline-color-focused-element before:w-full before:h-full before:block before:absolute before:rounded-2xl ${
          isActive || forceActive
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
        className={`shrink-0 flex flex-row gap-2 justify-between items-center h-full w-full pl-4 pr-12 py-2 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {icon}
        <div
          className={`grow text-xl font-medium text-color-header-text ${textAlignment}`}
        >
          {children}
        </div>
      </div>
    </NavLink>
  </div>
);
