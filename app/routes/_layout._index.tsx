import { NavLink } from "@remix-run/react";
import { ThemeDropdown } from "~/components/logic/theme";

interface IndexNavButtonProps {
  to: string;
  title: string;
  className: string;
  children: React.ReactNode;
}

const IndexNavButton: React.FunctionComponent<IndexNavButtonProps> = ({
  to,
  title,
  className,
  children,
}) => (
  <NavLink
    prefetch="intent"
    to={to}
    className={`bg-color-nearest-bg active:bg-color-button-down text-color-header-text shrink-0 flex items-center justify-center rounded-2xl shadow-lg hover:shadow-xl border-2 hover:border-4 transition-all  w-80 m-4 tablet:m-8 ${className}`}
  >
    <div className="m-1 flex flex-col justify-center items-center text-center w-72">
      <div className="border-b border-color-divider-line/80 border-solid w-full">
        <h2 className="text-3xl font-light">{title}</h2>
      </div>
      <div>
        <p>{children}</p>
      </div>
    </div>
  </NavLink>
);

export default function Route() {
  return (
    <div className="text-color-body-text flex flex-col w-fit laptop:w-full min-h-full h-fit justify-center items-center space-y-8 py-4">
      <div className="flex flex-col justify-center items-center space-y-6">
        <h1 className="text-4xl tablet:text-5xl laptop:text-7xl desktop:text-8xl font-extralight laptop:font-thin shrink-0 text-center text-color-header-text min-h-0 mt-4">
          Welcome to Beehive
        </h1>
        <span className="text-lg text-center">
          <b className="font-semibold">New!</b> The{" "}
          <NavLink
            to="/apps"
            className="underline decoration-color-link-underline"
          >
            Apps page
          </NavLink>{" "}
          is here to help with independent releases!
        </span>
      </div>
      <div className="flex flex-wrap justify-center w-full max-w-7xl m-auto min-h-0 items-center">
        <div className="flex flex-wrap justify-center w-full max-w-7xl m-auto min-h-0 items-center">
          <IndexNavButton
            to="/environments"
            title="Environments"
            className="border-color-environment-border h-52"
          >
            Full access to entire environments, including BEEs and BEE templates
          </IndexNavButton>
          <IndexNavButton
            to="/apps"
            title="Apps"
            className="border-color-chart-border h-52"
          >
            Deploy new versions of your apps to alpha, staging, and production
          </IndexNavButton>
        </div>
        <div className="flex flex-wrap justify-center w-full max-w-7xl m-auto min-h-0 items-center">
          <IndexNavButton
            to="/clusters"
            title="Clusters"
            className="border-color-cluster-border h-36"
          >
            Browse Kubernetes clusters containing our deployments
          </IndexNavButton>
          <IndexNavButton
            to="/trigger-incident/prod"
            title="Trigger Incident"
            className="border-color-neutral-soft-border h-36"
          >
            Page someone about a problem with production Terra
          </IndexNavButton>
          <IndexNavButton
            to="/charts"
            title="Charts"
            className="border-color-chart-border h-36"
          >
            Browse Helm Charts that deploy apps and infrastructure alike
          </IndexNavButton>
        </div>
      </div>
      <div className="flex flex-col items-center laptop:flex-row gap-2 justify-center font-light">
        <NavLink to="/users" prefetch="intent">
          View Users
        </NavLink>
        <span className="hidden laptop:inline laptop:last:hidden">•</span>
        <NavLink to="/pagerduty-integrations" prefetch="intent">
          Manage PagerDuty
        </NavLink>
        <span className="hidden laptop:inline laptop:last:hidden">•</span>
        <NavLink to="/misc" prefetch="intent">
          Misc
        </NavLink>
      </div>
      <ThemeDropdown />
    </div>
  );
}
