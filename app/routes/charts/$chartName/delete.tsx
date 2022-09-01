import { ActionFunction, redirect } from "@remix-run/node"
import { NavLink, useOutletContext, useParams } from "@remix-run/react"
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock"
import { FunctionComponent } from "react"
import { verifyAuthenticityToken } from "remix-utils"
import DeletePanel from "~/components/panels/delete"
import { catchBoundary, errorBoundary } from "~/components/remix/boundaries"
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server"
import { getSession } from "~/sessions.server"

export const handle = {
    breadcrumb: () => {
        const params = useParams()
        return <NavLink to={`/charts/${params.chartName}/delete`}>Delete</NavLink>
    }
}

export const action: ActionFunction = async ({ request, params }) => {
    const session = await getSession(request.headers.get("Cookie"))
    await verifyAuthenticityToken(request, session)

    await new ChartsApi(SherlockConfiguration)
        .apiV2ChartsSelectorDelete({ selector: params.chartName || "" }, forwardIAP(request))
        .catch(throwErrorResponses)

    return redirect("/charts")
}

export const CatchBoundary = catchBoundary
export const ErrorBoundary = errorBoundary

const ChartsChartNameDeleteRoute: FunctionComponent = () => {
    const { chart } = useOutletContext<{ chart: V2controllersChart }>()
    return (
        <div className="shrink-0 grow bg-white overflow-y-auto">
            <DeletePanel name={chart.name} borderClassName="border-sky-300" backgroundClassName="bg-sky-50">
                <h2 className="text-2xl font-light">Are you sure you want to delete the <span className="font-medium">{chart.name}</span> Helm Chart?</h2>
                <p>This will soft-delete it from DevOps's Sherlock source-of-truth service. Information about the chart, including chart versions and app versions, will become inaccessible. <b>Our ability to deploy or maintain instances of the chart will be removed.</b></p>
                <p>This will not delete it from the Helm Repo where tar-balled artifacts are stored, or from the Git repo where the source files are stored.</p>
                <p>After deletion, the name of the chart will remain reserved in Sherlock forever. You will not be able to create a new chart with the same name.</p>
            </DeletePanel>
        </div>
    )
}

export default ChartsChartNameDeleteRoute
