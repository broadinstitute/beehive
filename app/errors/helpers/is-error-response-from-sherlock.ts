import type { ErrorsErrorResponse } from "@sherlock-js-client/sherlock";

export function isErrorResponseFromSherlock(
  data: any,
): data is ErrorsErrorResponse {
  return (
    data.hasOwnProperty("message") &&
    data.hasOwnProperty("toBlame") &&
    data.hasOwnProperty("type")
  );
}
