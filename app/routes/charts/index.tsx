import { FunctionComponent } from "react"

const ChartsIndexRoute: FunctionComponent = () => (
    <div className="m-auto flex flex-col items-center w-[33vw] text-center font-light space-y-2">
        <h1 className="text-5xl font-medium">Charts and Apps</h1>
        <p>Helm Charts are how we deploy different applications or infrastructure components to Kubernetes.</p>
        <p>Charts themselves always have a Chart Version, and ones that deploy applications will have a configurable App Version too.</p>
        <p>Head over to an Environment or Cluster to work with actual configurable instances of Charts, called Chart Releases.</p>
    </div>
)

export default ChartsIndexRoute
