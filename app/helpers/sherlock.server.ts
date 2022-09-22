import { json, TypedResponse } from "@remix-run/node";
import { Configuration, ResponseError } from "@sherlock-js-client/sherlock";
import {
  ActionErrorInfo,
  DerivedErrorInfo,
  deriveErrorInfoFromResponse,
} from "./errors";

export const SherlockConfiguration = new Configuration({
  basePath: process.env.SHERLOCK_URL || "http://localhost:8080",
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
