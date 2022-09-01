import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { MiscApi, MiscMyUserResponse, MiscVersionResponse } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundary, errorBoundary } from "~/components/remix/boundaries";
import { forwardIAP, SherlockConfiguration, throwErrorResponses } from "~/helpers/sherlock.server";

export const handle = {
    breadcrumb: () => <NavLink to="/misc">Misc</NavLink>
}

export const loader: LoaderFunction = async ({ request }) => {
    const api = new MiscApi(SherlockConfiguration)
    return [
        await api
            .versionGet(forwardIAP(request))
            .catch(throwErrorResponses),
        await api
            .myUserGet(forwardIAP(request))
            .catch(throwErrorResponses)
    ]
}

export const CatchBoundary = catchBoundary
export const ErrorBoundary = errorBoundary

const MiscRoute: FunctionComponent = () => {
    const [version, myUser]: [MiscVersionResponse, MiscMyUserResponse] = useLoaderData()
    return (
        <div className="m-auto text-center">
            <p title={JSON.stringify(version.buildInfo, null, 2)}>
                Sherlock version <span className="font-mono"> {version.version}</span> built on <span className="font-mono"> {version.goVersion}</span>
            </p>
            <br />
            <p title={JSON.stringify(myUser.rawInfo, null, 2)}>
                You are <span className="font-mono"> {myUser.email}</span>; {myUser.suitability}
            </p>
        </div >
    )
}

export default MiscRoute
