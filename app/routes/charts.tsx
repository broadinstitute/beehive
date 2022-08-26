import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundaryForErrorResponses, errorBoundary } from "~/components/boundaries";
import LineNavButton from "~/components/line-nav-button";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: () => <NavLink to="/charts">Charts</NavLink>
}

export const loader: LoaderFunction = async ({ request }) => {
    return new ChartsApi(SherlockConfiguration)
        .apiV2ChartsGet({}, forwardIAP(request))
        .catch(throwErrorResponses)
}

export const CatchBoundary = catchBoundaryForErrorResponses
export const ErrorBoundary = errorBoundary

const ChartsRoute: FunctionComponent = () => {
    const charts: Array<V2controllersChart> = useLoaderData()
    return (
        <div className="flex flex-row h-full overflow-x-auto scroll-smooth">
            <div className="w-[33vw] shrink-0 overflow-auto flex flex-col items-center space-y-4 py-4">
                {charts.map((chart, index) =>
                    <LineNavButton
                        to={`/charts/${chart.name}`}
                        id={index.toString()}
                        sizeClassName="w-[30vw]"
                        colorClassName="border-sky-300">
                        <h2 className="font-light">{chart.chartRepo}</h2>
                        <h2 className="font-light mx-1">/</h2>
                        <h2 className="font-medium">{chart.name}</h2>
                    </LineNavButton>
                )}
            </div>
            <Outlet />
        </div>
    )
}


export default ChartsRoute
