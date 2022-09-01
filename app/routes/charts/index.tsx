import { FunctionComponent } from "react"
import PlaceholderPanel from "~/components/panels/placeholder"

const ChartsIndexRoute: FunctionComponent = () =>
    <PlaceholderPanel title="Charts and Apps">
        <p>Helm Charts are how we deploy different applications or infrastructure components to Kubernetes.</p>
        <p>Charts themselves always have a Chart Version, and ones that deploy applications will have a configurable App Version too.</p>
        <p>Head over to an Environment or Cluster to work with actual configurable instances of Charts, called Chart Releases.</p>
    </PlaceholderPanel>

export default ChartsIndexRoute
