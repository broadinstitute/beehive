import { useCatch } from "@remix-run/react";
import { deriveErrorInfo } from "../../helpers/errors";

export function catchBoundary() {
  const caught = useCatch();
  const { title, message, reloadRequired } = deriveErrorInfo(
    caught.status,
    caught.data
  );
  return (
    <div className="bg-rose-50 border-rose-400 border-2 rounded-lg p-1 border-dashed grow max-w-[33vw]">
      <p className="font-semibold">{title}</p>
      {(reloadRequired && (
        <button
          onClick={() => window.location.reload()}
          className="m-2 p-1 bg-rose-100 border-rose-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
        >
          Refresh Page
        </button>
      )) || (
        <button
          onClick={() => history.back()}
          className="m-2 p-1 bg-rose-100 border-rose-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
        >
          Go Back
        </button>
      )}
      <p className="font-light">{message}</p>
    </div>
  );
}
