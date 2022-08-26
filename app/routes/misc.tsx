import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { MiscApi, MiscVersionResponse } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundaryForErrorResponses, errorBoundary } from "~/components/boundaries";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: () => <NavLink to="/misc">Misc</NavLink>
}

export const loader: LoaderFunction = async ({ request }) => {
    return new MiscApi(SherlockConfiguration)
        .versionGet(forwardIAP(request))
        .catch(throwErrorResponses)
}

export const CatchBoundary = catchBoundaryForErrorResponses
export const ErrorBoundary = errorBoundary

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
