import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData, useParams } from "@remix-run/react";
import { AppVersionsApi, V2controllersAppVersion } from "@sherlock-js-client/sherlock";
import { FunctionComponent, useEffect, useRef } from "react";
import { catchBoundaryForErrorResponses, errorBoundary } from "~/components/remix/boundaries";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: (routeData: V2controllersAppVersion) => {
        const params = useParams()
        return <NavLink to={`/charts/${params.chartName}/app-versions/${params.appVersionID}`}>{routeData.appVersion}</NavLink>
    }
}

export const loader: LoaderFunction = async ({ request, params }) => {
    return new AppVersionsApi(SherlockConfiguration)
        .apiV2AppVersionsSelectorGet({ selector: params.appVersionID || "" }, forwardIAP(request))
        .catch(throwErrorResponses)
}

export const CatchBoundary = catchBoundaryForErrorResponses
export const ErrorBoundary = errorBoundary

const ChartsChartNameChartVersionsChartVersionIDRoute: FunctionComponent = () => {
    const appVersion: V2controllersAppVersion = useLoaderData()
    const ref = useRef(null)
    useEffect(() => {
        (ref.current as Element | null)?.scrollIntoView()
    }, [appVersion])
    return (
        <div className="flex flex-row h-full">
            <div className="w-[33vw] shrink-0 bg-white shadow-lg p-8 h-full border-l-4 border-rose-300" ref={ref}>
                <h2 className="text-xl font-light">App Version of {appVersion.chart}:</h2>
                <h1 className="text-4xl font-medium mb-4">{appVersion.appVersion}</h1>
                <p>Created at {appVersion.createdAt}</p>
                {appVersion.gitBranch && <p>Git Branch <a href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}/tree/${appVersion.gitBranch}`} className="font-mono decoration-blue-500 underline">{appVersion.gitBranch}</a></p>}
                {appVersion.gitCommit && <p>Git Commit <a href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}/commit/${appVersion.gitCommit}`} className="font-mono decoration-blue-500 underline">{appVersion.gitCommit}</a></p>}
            </div>
        </div>
    )
}

export default ChartsChartNameChartVersionsChartVersionIDRoute
