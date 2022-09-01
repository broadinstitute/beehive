import { FunctionComponent } from "react"
import PlaceholderPanel from "~/components/panels/placeholder"

const ChartsChartNameIndexRoute: FunctionComponent = () =>
    <PlaceholderPanel title="Chart and App Version">
        <p>Every time a new version of a Chart or an App gets created, it gets reported to DevOps's systems.</p>
        <p>Click the buttons to the left to view the available versions related to this Chart.</p>
    </PlaceholderPanel>

export default ChartsChartNameIndexRoute
