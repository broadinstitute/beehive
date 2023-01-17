import { useCatch } from "@remix-run/react";
import { deriveErrorInfo } from "../../helpers/errors";

export function catchBoundary() {
  const caught = useCatch();
  const { title, message, reloadRequired } = deriveErrorInfo(
    caught.status,
    caught.data
  );
  return (
    <div className="bg-color-error-bg border-color-error-border border-2 rounded-lg p-1 border-dashed grow max-w-[100vw] lg:max-w-[33vw]">
      <p className="font-semibold">{title}</p>
      {(reloadRequired && (
        <button
          onClick={() =>
            // https://developer.mozilla.org/en-US/docs/Web/API/Location/reload#parameters
            // @ts-ignore
            window.location.reload(true)
          }
          className="m-2 p-1 bg-color-error-button border-color-error-border border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
        >
          Refresh Page
        </button>
      )) || (
        <button
          onClick={() => history.back()}
          className="m-2 p-1 bg-color-error-button border-color-error-border border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
        >
          Go Back
        </button>
      )}
      <p className="font-light">{message}</p>
    </div>
  );
}
