import { ActionFunction, redirect } from "@remix-run/node"
import { NavLink, Outlet } from "@remix-run/react"
import { ChartsApi } from "@sherlock-js-client/sherlock"
import { FunctionComponent } from "react"
import { verifyAuthenticityToken } from "remix-utils"
import TextField from "~/components/common/text-field"
import NewPanel from "~/components/panels/new"
import { catchBoundary, errorBoundary } from "~/components/remix/boundaries"
import { SherlockConfiguration, forwardIAP, throwErrorResponses } from "~/helpers/sherlock.server"
import { getSession } from "~/sessions.server"

export const handle = {
    breadcrumb: () => <NavLink to={`/charts/new`}>New</NavLink>
}

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"))
    await verifyAuthenticityToken(request, session)

    const chart = await new ChartsApi(SherlockConfiguration)
        .apiV2ChartsPost({
            chart: Object.fromEntries(await request.formData())
        }, forwardIAP(request))
        .catch(throwErrorResponses)

    return redirect(`/charts/${chart?.name || ""}`)
}

export const CatchBoundary = catchBoundary
export const ErrorBoundary = errorBoundary

const ChartsNewRoute: FunctionComponent = () => {
    return (
        <div className="flex flex-row h-full grow">
            <NewPanel name="Chart" borderClassName="border-sky-300" backgroundClassName="bg-sky-50">
                <h2 className="font-light text-3xl">Chart Info</h2>
                <label>
                    <h3 className="font-light text-2xl">Chart Name</h3>
                    <p>This is the name of the Helm Chart. It cannot be changed once the chart is created. Chart names should be short and lowercase—digits and hyphens are also allowed.</p>
                    <TextField name="name" required pattern="[a-z][a-z\-0-9]*[a-z0-9]" />
                </label>
                <label>
                    <h3 className="font-light text-2xl">Chart Repo</h3>
                    <p>This is the name of the Helm Repo that the tar-balled chart artifacts should be downloaded from.</p>
                    <TextField name="chartRepo" defaultValue="terra-helm" required />
                </label>
                <br />
                <div className="border-t border-zinc-400" />
                <br />
                <h2 className="font-light text-3xl">App Info</h2>
                <label>
                    <h2 className="font-light text-2xl">App GitHub Repo</h2>
                    <p>This is the repo on GitHub that the app's Docker image is built from. This should be given in the form <b>organization-name/repo-name</b>.</p>
                    <TextField name="appImageGitRepo" pattern="(.+/.+)?" />
                </label>
                <label>
                    <h2 className="font-light text-2xl">Main Branch</h2>
                    <p>This is the branch in the above GitHub repo that is stable and intended for production. If an instance of this chart is spun up and no version of the app is specified, it'll track the versions built from this branch.</p>
                    <TextField name="appImageGitMainBranch" />
                </label>
            </NewPanel>
            <Outlet />
        </div>
    )
}

export default ChartsNewRoute