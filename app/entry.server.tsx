import { PassThrough } from "stream";
import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import { getContentSecurityPolicy } from "./csp.server";

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    let { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady: () => {
          let body = new PassThrough();

          const nonce: string | undefined =
            remixContext.appState.catchBoundaryRouteId === "root" &&
            remixContext.appState.error
              ? // Root boundaries can't have the nonce because they don't
                // call the loader
                undefined
              : remixContext.routeData.root?.cspScriptNonce;
          responseHeaders.set(
            "Content-Security-Policy",
            getContentSecurityPolicy(nonce)
          );

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError: (err) => {
          reject(err);
        },
        onError: (error) => {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
