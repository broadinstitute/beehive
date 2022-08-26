import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { AppVersionsApi, ChartVersionsApi, V2controllersAppVersion, V2controllersChartVersion } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundaryForErrorResponses, errorBoundary } from "~/components/remix/boundaries";
import LineNavButton from "~/components/common/line-nav-button";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: () => {
        const params = useParams()
        return <NavLink to={`/charts/${params.chartName}/app-versions`}>App Versions</NavLink>
    }
}

export const loader: LoaderFunction = async ({ request, params }) => {
    return new AppVersionsApi(SherlockConfiguration)
        .apiV2AppVersionsGet({ chart: params.chartName || "" }, forwardIAP(request))
        .catch(throwErrorResponses)
}

export const CatchBoundary = catchBoundaryForErrorResponses
export const ErrorBoundary = errorBoundary

const ChartsChartNameAppVersionsRoute: FunctionComponent = () => {
    const params = useParams()
    const appVersions: Array<V2controllersAppVersion> = useLoaderData()
    return (
        <div className="flex flex-row h-full">
            <div className="w-[33vw] shrink-0 overflow-auto flex flex-col items-center space-y-4 py-4">
                {appVersions.map((appVersion, index) =>
                    <LineNavButton
                        to={`/charts/${params.chartName}/app-versions/${appVersion.id}`}
                        id={index.toString()}
                        sizeClassName="w-[30vw]"
                        colorClassName="border-rose-300">
                        <h2 className="font-light">{params.chartName}</h2>
                        <h2 className="font-light mx-1">App @</h2>
                        <h2 className="font-medium">{appVersion.appVersion}</h2>
                    </LineNavButton>
                )}
                {appVersions.length == 0 && <p>{"(There's no App Versions here)"}</p>}
            </div>
            <Outlet />
        </div>
    )
}

export default ChartsChartNameAppVersionsRoute