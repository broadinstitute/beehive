import { useCatch } from "@remix-run/react"
import { ErrorsErrorResponse } from "@sherlock-js-client/sherlock"

export function catchBoundary(defaultRemote: string = "Sherlock") {
    const caught = useCatch()

    let subject = defaultRemote
    let message: string | undefined = (caught.data as ErrorsErrorResponse).message
    if (message !== undefined) {
        subject = "Sherlock"
        message = `Error directly from Sherlock: ${message}`
    }
    if (message === undefined) {
        try {
            const parsed = JSON.parse(caught.data as string)
            if (parsed.message !== undefined) {
                message = parsed.message
            } else if (parsed !== undefined) {
                message = String(parsed)
            }
        } catch (error) { }
    }
    if (message === undefined) {
        message = JSON.stringify(caught.data)
    }
    return (
        <div className="bg-rose-50 border-rose-400 border-2 rounded-lg p-1 border-dashed grow">
            <p className="font-semibold">{subject} Error: {caught.status} {(caught.data as ErrorsErrorResponse).type || "Response"}</p>
            {(caught.data as ErrorsErrorResponse).toBlame == "server" &&
                <button
                    onClick={() => window.location.reload()}
                    className="m-2 p-1 bg-rose-100 border-rose-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all">
                    Refresh Page
                </button> ||
                <button
                    onClick={() => history.back()}
                    className="m-2 p-1 bg-rose-100 border-rose-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all">
                    Go Back
                </button>
            }
            <p className="font-light">{message}</p>
        </div>
    )
}

export function errorBoundary({ error }: { error: Error }) {
    return (
        <div className="bg-rose-50 border-rose-400 border-2 rounded-lg p-1 border-dashed grow">
            <p className="font-semibold">Beehive UI Error: {error.message}</p>
            <button
                onClick={() => window.location.reload()}
                className="m-2 p-1 bg-rose-100 border-rose-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all">
                Refresh Page
            </button>
            <p className="font-light">{error.stack}</p>
        </div>
    )
}