import type { EntryContext, HandleDataRequestFunction } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "stream";
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

    const nonce: string | undefined =
      remixContext.staticHandlerContext.loaderData["root"]?.cspScriptNonce;

    let { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        nonce: nonce,
        onShellReady: () => {
          let body = new PassThrough();

          responseHeaders.set(
            "Content-Security-Policy",
            getContentSecurityPolicy(nonce)
          );

          responseHeaders.set("Content-Type", "text/html");
          responseHeaders.set("Cache-Control", "no-cache");

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

export const handleDataRequest: HandleDataRequestFunction = (response) => {
  response.headers.set("Cache-Control", "no-cache");
  return response;
};
