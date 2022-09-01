import { ActionFunction, redirect } from "@remix-run/node"
import { NavLink, useOutletContext, useParams } from "@remix-run/react"
import { EnvironmentsApi, V2controllersEnvironment } from "@sherlock-js-client/sherlock"
import { FunctionComponent } from "react"
import { verifyAuthenticityToken } from "remix-utils"
import DeletePanel from "~/components/panels/delete"
import { catchBoundary, errorBoundary } from "~/components/remix/boundaries"
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server"
import { getSession } from "~/sessions.server"

export const handle = {
    breadcrumb: () => {
        const params = useParams()
        return <NavLink to={`/environments/${params.environmentName}/delete`}>Delete</NavLink>
    }
}

export const action: ActionFunction = async ({ request, params }) => {
    const session = await getSession(request.headers.get("Cookie"))
    await verifyAuthenticityToken(request, session)

    await new EnvironmentsApi(SherlockConfiguration)
        .apiV2EnvironmentsSelectorDelete({ selector: params.environmentName || "" }, forwardIAP(request))
        .catch(throwErrorResponses)

    return redirect("/environments")
}

export const CatchBoundary = catchBoundary
export const ErrorBoundary = errorBoundary

const EnvironmentsEnvironmentNameDeleteRoute: FunctionComponent = () => {
    const { environment } = useOutletContext<{ environment: V2controllersEnvironment }>()
    return (
        <div className="shrink-0 grow bg-white overflow-y-auto">
            <DeletePanel name={environment.name} deleteGuard={environment.lifecycle !== "dynamic"} borderClassName="border-amber-300" backgroundClassName="bg-amber-50">
                <h2 className="text-2xl font-light">Are you sure you want to delete the <span className="font-medium">{environment.name}</span> {environment.lifecycle} environment?</h2>
                <p>This will soft-delete it from DevOps's Sherlock source-of-truth service.</p>
                {environment.lifecycle === "dynamic" && <p>Since this environment is dynamic, that will cause it to become unrendered by Thelma, meaning that the entire deployment will get wiped from our infrastructure.</p>}
                {environment.lifecycle === "template" && <p>Since this environment is a template, any BEEs based on it will continue functioning but no new ones will be able to be created.</p>}
                {environment.lifecycle === "static" && <p>Since this environment is static, all Kubernetes resources will cease being rendered by Thelma. There are protections in place that will prevent immediate deletion, and Terraform resources like databases will be unaffected. You should contact DevOps before proceeding.</p>}
                <p>This will not delete any associated configuration from our Helm values in <a href="https://github.com/broadinstitute/terra-helmfile" className="decoration-blue-500 underline">terra-helmfile</a>.</p>
                <p>After deletion, the name of the environment will remain reserved in Sherlock forever. You will not be able to create a new environment with the same name.</p>
            </DeletePanel>
        </div>
    )
}

export default EnvironmentsEnvironmentNameDeleteRoute