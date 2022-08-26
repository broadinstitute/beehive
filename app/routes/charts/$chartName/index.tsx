import { FunctionComponent } from "react"

const ChartsChartNameIndexRoute: FunctionComponent = () => (
    <div className="m-auto flex flex-col items-center w-[33vw] text-center font-light space-y-2 p-4">
        <h1 className="text-5xl font-medium">Chart and App Versions</h1>
        <p>Every time a new version of a Chart or an App gets created, it gets reported to DevOps's systems.</p>
        <p>Click the buttons to the left to view the available versions related to this Chart.</p>
    </div>
)

export default ChartsChartNameIndexRoute
