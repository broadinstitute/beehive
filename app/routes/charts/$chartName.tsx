import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundaryForErrorResponses, errorBoundary } from "~/components/boundaries";
import LineNavButton from "~/components/line-nav-button";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: () => {
        const params = useParams()
        return <NavLink to={`/charts/${params.chartName}`}>{params.chartName}</NavLink>
    }
}

export const loader: LoaderFunction = async ({ request, params }) => {
    return new ChartsApi(SherlockConfiguration)
        .apiV2ChartsSelectorGet({ selector: params.chartName || "" }, forwardIAP(request))
        .catch(throwErrorResponses)
}

export const CatchBoundary = catchBoundaryForErrorResponses
export const ErrorBoundary = errorBoundary

const ChartsChartNameRoute: FunctionComponent = () => {
    const chart: V2controllersChart = useLoaderData()
    return (
        <div className="flex flex-row h-full">
            <div className="w-[33vw] shrink-0 bg-white shadow-lg p-8 h-full border-l-4 border-sky-300">
                <h2 className="text-xl font-light">Helm Chart from {chart.chartRepo}:</h2>
                <h1 className="text-4xl font-medium mb-4">{chart.name}</h1>
                <LineNavButton
                    to={`/charts/${chart.name}/chart-versions`}
                    sizeClassName="w-[29vw]"
                    colorClassName="border-violet-300">
                    <h2 className="font-medium">View Chart Versions</h2>
                </LineNavButton>
                {chart.appImageGitRepo && (
                    <div className="mt-8">
                        <p>This Helm Chart deploys a specific application:</p>
                        <a href={`https://github.com/${chart.appImageGitRepo}`}>
                            <h2 className="text-2xl font-medium decoration-blue-500 underline">{chart.appImageGitRepo}</h2>
                        </a>
                        {chart.appImageGitMainBranch && (
                            <p className="mt-2">The app's stable branch is <a href={`https://github.com/${chart.appImageGitRepo}/tree/${chart.appImageGitMainBranch}`} className="font-mono decoration-blue-500 underline">{chart.appImageGitMainBranch}</a>.</p>
                        )}
                        <LineNavButton
                            to={`/charts/${chart.name}/app-versions`}
                            sizeClassName="w-[29vw]"
                            colorClassName="border-rose-300">
                            <h2 className="font-medium">View App Versions</h2>
                        </LineNavButton>
                    </div>
                )}
            </div>
            <Outlet />
        </div>
    )
}

export default ChartsChartNameRoute