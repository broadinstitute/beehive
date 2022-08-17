import { FunctionComponent, ReactNode } from "react";
import ItemNavButton from "~/components/common/item-nav-button";

interface IndexNavButtonProps {
  to: string
  title: string
  className: string
  children: ReactNode
}

const IndexNavButton: FunctionComponent<IndexNavButtonProps> = ({ to, title, className, children }) =>
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

const IndexRoute: FunctionComponent = () =>
  <div className="md:flex flex-col h-full justify-center items-center space-y-8 mt-8 md:mt-0">
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extralight lg:font-thin shrink-0 text-center">Welcome to Beehive</h1>
    <div className="flex flex-wrap justify-center 2xl:justify-between w-full max-w-7xl h-auto m-auto">
      <IndexNavButton to="/clusters" title="Clusters" className="border-emerald-300">
        Browse Kubernetes clusters containing our deployments
      </IndexNavButton>
      <IndexNavButton to="/environments" title="Environments" className="border-amber-300">
        Browse live environments or BEE templates and instances
      </IndexNavButton>
      <IndexNavButton to="/charts" title="Charts and Apps" className="border-blue-300">
        Browse applications and the Helm Charts that deploy them
      </IndexNavButton>
    </div>
  </div >

export default IndexRoute
