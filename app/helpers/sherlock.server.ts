import { Configuration, ResponseError } from "@sherlock-js-client/sherlock";

export const SherlockConfiguration = new Configuration({
    basePath: process.env.SHERLOCK_URL || "http://localhost:8080"
})

const IapJwtHeader = "x-goog-iap-jwt-assertion"

export function forwardIAP(request: Request): RequestInit {
    return {
        headers: request.headers.has(IapJwtHeader) ? { [IapJwtHeader]: request.headers.get(IapJwtHeader)! } : undefined
    }
}

// Remix lets us throw both Errors and Responses. Responses go to the nearest catch boundary,
// while Errors go to the nearest error boundary. Here, we open up the reason a promise is
// about to fail, and throw a Response instead if there is one to trigger the right boundary.
export function throwErrorResponses(reason: any) {
    if (reason instanceof ResponseError) {
        throw reason.response
    }
    throw reason
}