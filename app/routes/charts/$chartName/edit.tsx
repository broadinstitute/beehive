import { ActionFunction, redirect } from "@remix-run/node"
import { NavLink, useOutletContext, useParams } from "@remix-run/react"
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock"
import { FunctionComponent } from "react"
import { verifyAuthenticityToken } from "remix-utils"
import TextField from "~/components/common/text-field"
import EditPanel from "~/components/panels/edit"
import { catchBoundary, errorBoundary } from "~/components/remix/boundaries"
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server"
import { getSession } from "~/sessions.server"

export const handle = {
    breadcrumb: () => {
        const params = useParams()
        return <NavLink to={`/charts/${params.chartName}/edit`}>Edit</NavLink>
    }
}

export const action: ActionFunction = async ({ request, params }) => {
    const session = await getSession(request.headers.get("Cookie"))
    await verifyAuthenticityToken(request, session)

    return new ChartsApi(SherlockConfiguration)
        .apiV2ChartsSelectorPatch({
            selector: params.chartName || "",
            chart: Object.fromEntries(await request.formData())
        }, forwardIAP(request))
        .catch(throwErrorResponses)
}

export const CatchBoundary = catchBoundary
export const ErrorBoundary = errorBoundary

const ChartsChartNameEditRoute: FunctionComponent = () => {
    const { chart } = useOutletContext<{ chart: V2controllersChart }>()
    return (
        <div className="shrink-0 grow bg-white overflow-y-auto">
            <EditPanel name={chart.name} borderClassName="border-sky-300" backgroundClassName="bg-sky-50">
                <h2 className="font-light text-3xl">Chart Info</h2>
                <label>
                    <h3 className="font-light text-2xl">Chart Repo</h3>
                    <p>This is the name of the Helm Repo that the tar-balled chart artifacts should be downloaded from.</p>
                    <TextField name="chartRepo" defaultValue={chart.chartRepo} required />
                </label>
                <br />
                <div className="border-t border-zinc-400" />
                <br />
                <h2 className="font-light text-3xl">App Info</h2>
                <label>
                    <h2 className="font-light text-2xl">App GitHub Repo</h2>
                    <p>This is the repo on GitHub that the app's Docker image is built from. This should be given in the form <b>organization-name/repo-name</b>.</p>
                    <TextField name="appImageGitRepo" defaultValue={chart.appImageGitRepo} pattern="(.+/.+)?" />
                </label>
                <label>
                    <h2 className="font-light text-2xl">Main Branch</h2>
                    <p>This is the branch in the above GitHub repo that is stable and intended for production. If an instance of this chart is spun up and no version of the app is specified, it'll track the versions built from this branch.</p>
                    <TextField name="appImageGitMainBranch" defaultValue={chart.appImageGitMainBranch} />
                </label>
            </EditPanel>
        </div>
    )
}

export default ChartsChartNameEditRoute
