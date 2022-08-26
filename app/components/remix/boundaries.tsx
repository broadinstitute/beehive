import { useCatch } from "@remix-run/react"
import { ErrorsErrorResponse } from "@sherlock-js-client/sherlock"

export function catchBoundaryForErrorResponses() {
    const caught = useCatch()
    return (
        <div className="bg-rose-50 border-rose-400 border-2 rounded-lg p-1">
            <p className="font-semibold">Unexpected {caught.status} {(caught.data as ErrorsErrorResponse).type}</p>
            {(caught.data as ErrorsErrorResponse).toBlame == "server" && <button
                onClick={() => window.location.reload()}
                className="m-2 p-1 bg-rose-100 border-rose-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all">
                Refresh Page
            </button>}
            <p className="font-light">{(caught.data as ErrorsErrorResponse).message || caught.data}</p>
        </div>
    )
}

export function errorBoundary({ error }: { error: Error }) {
    return (
        <div className="bg-rose-50 border-rose-400 border-2 rounded-lg p-1 border-dashed">
            <p className="font-semibold">Beehive Error: {error.message}</p>
            <button
                onClick={() => window.location.reload()}
                className="m-2 p-1 bg-rose-100 border-rose-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all">
                Refresh Page
            </button>
            <p className="font-light">{error.stack}</p>
        </div>
    )
}