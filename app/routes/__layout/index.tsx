import { NavLink } from "@remix-run/react";

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
    className={`bg-white active:bg-zinc-50 shrink-0 flex items-center justify-center rounded-2xl shadow-lg hover:shadow-xl border-2 hover:border-4 transition-all duration-75 w-80 m-4 md:m-8 ${className}`}
  >
    <div className="m-1 flex flex-col justify-center items-center text-center w-72">
      <div className="border-b border-zinc-300 border-solid w-full">
        <h2 className="text-3xl font-light">{title}</h2>
      </div>
      <div>
        <p>{children}</p>
      </div>
    </div>
  </NavLink>
);

const IndexRoute: React.FunctionComponent = () => (
  <div className="md:flex flex-col h-full justify-center items-center space-y-8 mt-8 md:mt-0 min-h-0">
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extralight lg:font-thin shrink-0 text-center min-h-0 mt-4">
      Welcome to Beehive
    </h1>
    <div className="flex flex-wrap justify-center w-full max-w-7xl m-auto min-h-0 items-center">
      <IndexNavButton
        to="/clusters"
        title="Clusters"
        className="border-green-300 h-52"
      >
        Browse Kubernetes clusters containing our deployments
      </IndexNavButton>
      <IndexNavButton
        to="/environments"
        title="Environments"
        className="border-amber-300 h-52"
      >
        Browse live environments, BEEs, and BEE templates
      </IndexNavButton>
      <IndexNavButton
        to="/charts"
        title="Charts and Apps"
        className="border-sky-300 h-52"
      >
        Browse applications and the Helm Charts that deploy them
      </IndexNavButton>
      <IndexNavButton to="/misc" title="Misc" className="border-zinc-300 h-28">
        Debugging info for Beehive itself
      </IndexNavButton>
    </div>
  </div>
);

export default IndexRoute;
