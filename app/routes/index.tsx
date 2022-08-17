import { FunctionComponent, ReactNode } from "react";
import ItemNavButton from "~/components/common/item-nav-button";

interface IndexNavButtonProps {
  to: string
  title: string
  className: string
  children: ReactNode
}

const BigIndexNavButton: FunctionComponent<IndexNavButtonProps> = ({ to, title, className, children }) =>
  <ItemNavButton
    to={to}
    className={`h-52 w-80 m-4 md:m-8 ${className}`}
  >
    <div className="h-[11.5rem] w-[18.5rem] flex flex-col justify-center items-center text-center">
      <div className="w-72 border-b border-zinc-300 border-solid">
        <h2 className="text-3xl font-light">{title}</h2>
      </div>
      <div>
        <p>{children}</p>
      </div>
    </div>
  </ItemNavButton>

const SmallIndexNavButton: FunctionComponent<IndexNavButtonProps> = ({ to, title, className, children }) =>
  <ItemNavButton
    to={to}
    className={`h-28 w-80 m-4 md:m-8 ${className}`}
  >
    <div className="h-[6.5rem] w-[18.5rem] flex flex-col justify-center items-center text-center">
      <div className="w-72 border-b border-zinc-300 border-solid">
        <h2 className="text-3xl font-light">{title}</h2>
      </div>
      <div>
        <p>{children}</p>
      </div>
    </div>
  </ItemNavButton>

const IndexRoute: FunctionComponent = () =>
  <div className="md:flex flex-col h-full justify-center items-center space-y-8 mt-8 md:mt-0 min-h-0">
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extralight lg:font-thin shrink-0 text-center min-h-0 mt-4">Welcome to Beehive</h1>
    <div className="flex flex-wrap justify-center w-full max-w-7xl m-auto min-h-0 items-center">
      <BigIndexNavButton to="/clusters" title="Clusters" className="border-emerald-300">
        Browse Kubernetes clusters containing our deployments
      </BigIndexNavButton>
      <BigIndexNavButton to="/environments" title="Environments" className="border-amber-300">
        Browse live environments or BEE templates and instances
      </BigIndexNavButton>
      <BigIndexNavButton to="/charts" title="Charts and Apps" className="border-blue-300">
        Browse applications and the Helm Charts that deploy them
      </BigIndexNavButton>
      <SmallIndexNavButton to="/chart-releases" title="Chart Releases" className="border-zinc-300">
        Browse chart deployments in bulk
      </SmallIndexNavButton>
      <SmallIndexNavButton to="/misc" title="Misc" className="border-zinc-300">
        Debugging info for Beehive itself
      </SmallIndexNavButton>
    </div>
  </div >

export default IndexRoute
