import { LoaderFunction } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { ErrorsErrorResponse, MiscApi, MiscVersionResponse } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: () => <NavLink to="/misc">Misc</NavLink>
}

export const loader: LoaderFunction = async ({ request }) => {
    return new MiscApi(SherlockConfiguration)
        .versionGet(forwardIAP(request))
        .catch(throwErrorResponses)
}

export function CatchBoundary() {
    const caught = useCatch()
    return (
        <div className="bg-red-50 border-red-400 border-2 rounded-lg p-1">
            <p className="font-semibold">Unexpected {caught.status} {(caught.data as ErrorsErrorResponse).type}</p>
            {(caught.data as ErrorsErrorResponse).toBlame == "server" && <button
                onClick={() => window.location.reload()}
                className="m-2 p-1 bg-red-100 border-red-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all">
                Refresh Page
            </button>}
            <p className="font-light">{(caught.data as ErrorsErrorResponse).message || caught.data}</p>
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    return (
        <div className="bg-red-100 border-red-400 border-2 rounded-lg p-1 border-dashed">
            <p className="font-semibold">Error {error.message}</p>
            <button
                onClick={() => window.location.reload()}
                className="m-2 p-1 bg-red-100 border-red-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all">
                Refresh Page
            </button>
            <p className="font-light">{error.stack}</p>
        </div>
    )
}

const MiscRoute: FunctionComponent = () => {
    const version: MiscVersionResponse = useLoaderData()
    return (
        <div className="m-auto">
            <p title={JSON.stringify(version.buildInfo, null, 2)}>
                Sherlock Version <span className="font-mono">{version.version}</span> built on <span className="font-mono">{version.goVersion}</span>
            </p>
        </div>
    )
}

export default MiscRoute
