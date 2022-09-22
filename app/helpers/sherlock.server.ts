import { json, TypedResponse } from "@remix-run/node";
import { Configuration, ResponseError } from "@sherlock-js-client/sherlock";
import {
  ActionErrorInfo,
  DerivedErrorInfo,
  deriveErrorInfoFromResponse,
} from "./errors";
import https from "https";

export const SherlockConfiguration = new Configuration({
  basePath: process.env.SHERLOCK_BASE_URL || "http://localhost:8080",
  fetchApi: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ): Promise<Response> => {
    return fetch(input, {
      ...init,
      // When the Sherlock URL exists and ends with the restricted .local TLD,
      // we're not connecting to something on the open internet--we're presumably
      // connecting to something in the cluster, where we will be using in-cluster
      // hostnames that don't match the TLS certificates we'll be receiving. Here
      // we reach down into node-fetch and tell it to ignore the certificate
      // validation error from the hostnames not matching. The alternatives here
      // are to allow HTTP connections to Sherlock (plainly worse) or to install
      // self-signed certificates onto both Sherlock and Beehive (extremely
      // difficult to manage).
      // TL;DR: We don't do TLS hostname validation when the hostname is in the
      // same cluster.
      // @ts-ignore
      agent: process.env.SHERLOCK_BASE_URL?.endsWith(".local")
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined,
    });
  },
});

const IapJwtHeader = "x-goog-iap-jwt-assertion";

export function forwardIAP(request: Request): RequestInit {
  return {
    headers: request.headers.has(IapJwtHeader)
      ? { [IapJwtHeader]: request.headers.get(IapJwtHeader)! }
      : undefined,
  };
}

// Intended for usage in LoaderFunctions, this function can `catch`
// a promise and throw ResponseErrors to the nearest CatchBoundary
// and everything else to the nearest ErrorBoundary.
export function errorResponseThrower(reason: any): void {
  if (reason instanceof ResponseError) {
    throw reason.response;
  }
  throw reason;
}

// Intended for usage in ActionFunctions, this function can handle
// `then`-`onrejected` cases to return ResponseErrors as
// DerivedErrorInfo objects and throw everything else to the nearest
// ErrorBoundary. This means a form can handle errors itself, to
// provide better UX than passing to the nearest CatchBoundary.
export async function errorResponseReturner(
  reason: any
): Promise<TypedResponse<DerivedErrorInfo>> {
  if (reason instanceof ResponseError) {
    return json<DerivedErrorInfo>(
      await deriveErrorInfoFromResponse(reason.response)
    );
  } else {
    throw reason;
  }
}

// A factory that returns functions like errorResponseReturner
// except they return an ActionErrorInfo to include the faulty
// request itself.
export function makeErrorResponserReturner<T>(
  faultyRequest: T
): (reason: any) => Promise<TypedResponse<ActionErrorInfo<T>>> {
  return async function (reason: any) {
    if (reason instanceof ResponseError) {
      return json<ActionErrorInfo<T>>({
        ...(await deriveErrorInfoFromResponse(reason.response)),
        faultyRequest: faultyRequest,
      });
    } else {
      throw reason;
    }
  };
}

export function formDataToObject(
  formData: FormData,
  omitEmptyFields: boolean = true
): { [key: string]: string } {
  const ret: { [key: string]: string } = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && (!omitEmptyFields || value !== "")) {
      ret[key] = value;
    }
  }
  return ret;
}
