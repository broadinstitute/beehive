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
    className={`bg-color-nearest-bg active:bg-color-button-down text-color-header-text shrink-0 flex items-center justify-center rounded-2xl shadow-lg hover:shadow-xl border-2 hover:border-4 transition-all  w-80 m-4 md:m-8 ${className}`}
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

const IndexRoute: React.FunctionComponent = () => (
  <div className="text-color-body-text flex flex-col h-fit lg:h-full justify-center items-center space-y-8 min-h-0 py-4">
    <div className="flex flex-col justify-center items-center space-y-6">
      <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extralight lg:font-thin shrink-0 text-center text-color-header-text min-h-0 mt-4">
        Welcome to Beehive
      </h1>
      <span className="text-lg">
        <b className="font-semibold">New!</b> View ArgoCD statuses in Beehive
      </span>
    </div>
    <div className="flex flex-wrap justify-center w-full max-w-7xl m-auto min-h-0 items-center">
      <IndexNavButton
        to="/clusters"
        title="Clusters"
        className="border-color-cluster-border h-52"
      >
        Browse Kubernetes clusters containing our deployments
      </IndexNavButton>
      <IndexNavButton
        to="/environments"
        title="Environments"
        className="border-color-environment-border h-52"
      >
        Browse live environments, BEEs, and BEE templates
      </IndexNavButton>
      <IndexNavButton
        to="/charts"
        title="Charts and Apps"
        className="border-color-chart-border h-52"
      >
        Browse apps and the Helm Charts that deploy them
      </IndexNavButton>
      <IndexNavButton
        to="/misc"
        title="Misc"
        className="border-color-neutral-soft-border h-28"
      >
        Debugging info for Beehive itself
      </IndexNavButton>
    </div>
    <ThemeDropdown />
  </div>
);

export default IndexRoute;
