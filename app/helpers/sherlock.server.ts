import { Configuration, InitOverrideFunction, ResponseError } from "@sherlock-js-client/sherlock";

export const SherlockConfiguration = new Configuration({
    basePath: process.env.SHERLOCK_URL || "http://localhost:8080"
})

const IapJwtHeader = "x-goog-iap-jwt-assertion"

export function forwardIAP(request: Request): RequestInit {
    return {
        headers: request.headers.has(IapJwtHeader) ? { [IapJwtHeader]: request.headers.get(IapJwtHeader)! } : undefined
    }
}

export function throwErrorResponses(reason: any) {
    if (reason instanceof ResponseError) {
        throw reason.response
    }
    throw reason
}