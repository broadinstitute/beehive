import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData, useParams } from "@remix-run/react";
import { ChartVersionsApi, V2controllersChartVersion } from "@sherlock-js-client/sherlock";
import { FunctionComponent, useEffect, useRef } from "react";
import { catchBoundaryForErrorResponses, errorBoundary } from "~/components/boundaries";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: (routeData: V2controllersChartVersion) => {
        const params = useParams()
        return <NavLink to={`/charts/${params.chartName}/chart-versions/${params.chartVersionID}`}>{routeData.chartVersion}</NavLink>
    }
}

export const loader: LoaderFunction = async ({ request, params }) => {
    return new ChartVersionsApi(SherlockConfiguration)
        .apiV2ChartVersionsSelectorGet({ selector: params.chartVersionID || "" }, forwardIAP(request))
        .catch(throwErrorResponses)
}

export const CatchBoundary = catchBoundaryForErrorResponses
export const ErrorBoundary = errorBoundary

const ChartsChartNameChartVersionsChartVersionIDRoute: FunctionComponent = () => {
    const chartVersion: V2controllersChartVersion = useLoaderData()
    const ref = useRef(null)
    useEffect(() => {
        (ref.current as Element | null)?.scrollIntoView()
    }, [chartVersion])
    return (
        <div className="flex flex-row h-full">
            <div className="w-[33vw] shrink-0 bg-white shadow-lg p-8 h-full border-l-4 border-violet-300" ref={ref}>
                <h2 className="text-xl font-light">Chart Version of {chartVersion.chart}:</h2>
                <h1 className="text-4xl font-medium mb-4">{chartVersion.chartVersion}</h1>
                <p>Created at {chartVersion.createdAt}</p>
            </div>
        </div>
    )
}

export default ChartsChartNameChartVersionsChartVersionIDRoute
