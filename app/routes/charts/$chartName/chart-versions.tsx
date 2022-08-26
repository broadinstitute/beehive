import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { ChartVersionsApi, V2controllersChartVersion } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundaryForErrorResponses, errorBoundary } from "~/components/boundaries";
import LineNavButton from "~/components/line-nav-button";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: () => {
        const params = useParams()
        return <NavLink to={`/charts/${params.chartName}/chart-versions`}>Chart Versions</NavLink>
    }
}

export const loader: LoaderFunction = async ({ request, params }) => {
    return new ChartVersionsApi(SherlockConfiguration)
        .apiV2ChartVersionsGet({ chart: params.chartName || "" }, forwardIAP(request))
        .catch(throwErrorResponses)
}

export const CatchBoundary = catchBoundaryForErrorResponses
export const ErrorBoundary = errorBoundary

const ChartsChartNameChartVersionsRoute: FunctionComponent = () => {
    const params = useParams()
    const chartVersions: Array<V2controllersChartVersion> = useLoaderData()
    return (
        <div className="flex flex-row h-full">
            <div className="w-[33vw] shrink-0 overflow-auto flex flex-col items-center space-y-4 py-4">
                {chartVersions.map((chartVersion, index) =>
                    <LineNavButton
                        to={`/charts/${params.chartName}/chart-versions/${chartVersion.id}`}
                        id={index.toString()}
                        sizeClassName="w-[30vw]"
                        colorClassName="border-violet-300">
                        <h2 className="font-light">{params.chartName}</h2>
                        <h2 className="font-light mx-1">Chart @</h2>
                        <h2 className="font-medium">{chartVersion.chartVersion}</h2>
                    </LineNavButton>
                )}
                {chartVersions.length == 0 && <p>{"(There's no Chart Versions here)"}</p>}
            </div>
            <Outlet />
        </div>
    )
}

export default ChartsChartNameChartVersionsRoute