import { TypedResponse } from "@remix-run/node";
import { ResponseError } from "@sherlock-js-client/sherlock";
import { json } from "react-router";
import {
  SummarizedErrorInfo,
  summarizeResponseError,
} from "./summarize-response-error";

export function errorResponseThrower(reason: any): never {
  if (reason instanceof ResponseError) {
    throw reason.response;
  }
  throw reason;
}

export interface ReturnedErrorInfo<T> {
  errorSummary: SummarizedErrorInfo;
  formState?: T;
}

export function makeErrorResponseReturner<T>(
  formState?: T
): (reason: any) => Promise<TypedResponse<ReturnedErrorInfo<T>>> {
  return async function (
    reason: any
  ): Promise<TypedResponse<ReturnedErrorInfo<T>>> {
    if (reason instanceof ResponseError) {
      return json<ReturnedErrorInfo<T>>({
        errorSummary: await summarizeResponseError(reason.response),
        formState,
      });
    }
    throw reason;
  };
}

// isReturnedErrorInfo is how we can handle form submissions that didn't do anything.
// A great example of this is a Sherlock Changeset plan. There's three cases:
//
// - some Changesets got created, we return a redirect to the Review Changes page
// - an error occured, we return said error
// - no error but no Changesets created either, we gotta return something
//
// That third case is tricky, because we want to handle the existing form state like
// there had been an error, but we don't want to tell the user there was an error.
//
// This function lets us do that. The key is to return `json({ formState: formData })`
// in that third case. It's like ReturnedErrorInfo but lacks the error. This function
// can consume that autogenerated union type and discriminate between the second and
// third cases to give you an error if there was one. The form state will always be
// at `actionData?.formState` so you'll have access to that too. See the Chart Release
// Change Versions pages for an example of this in action.
//
// (Yes, this seems simple--the function certainly is--but the types get super complex
// and this pattern brings it back down to earth)
export function isReturnedErrorInfo<T>(
  data:
    | ReturnedErrorInfo<T>
    | {
        formState?: T;
      }
): data is ReturnedErrorInfo<T> {
  return data.hasOwnProperty("errorSummary");
}