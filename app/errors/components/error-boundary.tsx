import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { isErrorResponseFromSherlock } from "../helpers/is-error-response-from-sherlock";
import { BackButton, ReloadButton } from "./error-buttons";

export const PanelErrorBoundary: V2_ErrorBoundaryComponent = () => {
  const error = useRouteError();
  const { title, body, status } = parseRouteError(error);
  return (
    <div className="bg-color-error-bg border-color-error-border text-color-body-text border-2 rounded-lg p-1 border-dashed grow w-[100vw] lg:w-[33vw]">
      <h3 className="font-semibold text-color-header-text">{title}</h3>
      {status === 404 && <BackButton />}
      {status === 422 && <ReloadButton />}
      <p className="font-light">{body}</p>
    </div>
  );
};

function parseRouteError(error: unknown): {
  title: string;
  body: string;
  status: number;
} {
  let title, body: string | undefined;
  let status: number = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (typeof error.data === "string") {
      try {
        error.data = JSON.parse(error.data);
      } catch (error) {}
    }
    if (isErrorResponseFromSherlock(error.data)) {
      title = `Error directly from Sherlock: ${error.status} ${error.data.type}`;
      body = error.data.message || "(no message)";
    } else {
      title = `Error from Beehive's backend: ${error.status}`;
      if (error.data.hasOwnProperty("message")) {
        try {
          body = String(error.data.message);
        } catch (error) {
          body = `Unknown error message, couldn't convert it to string due to ${error}`;
        }
      } else if (typeof error.data === "string") {
        body = error.data;
      } else {
        try {
          body = String(error.data);
        } catch (error) {
          body = `Unknown error, couldn't convert it to string due to ${error}`;
        }
      }
    }
  } else {
    if (error instanceof Error) {
      title = `Uncaught ${error.name} from Beehive: ${error.message}`;
      body = error.stack || "(no stack trace)";
    } else {
      title = "Uncaught unknown error from Beehive";
      try {
        body = String(error);
      } catch (error) {
        body = `Couldn't convert the error to string due to ${error}`;
      }
    }
  }

  const ret = { title, body, status };
  console.log(ret);
  return ret;
}
