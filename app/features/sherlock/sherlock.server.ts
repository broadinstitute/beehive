import { Configuration } from "@sherlock-js-client/sherlock";
import https from "https";

export const SherlockConfiguration = new Configuration({
  basePath: process.env.SHERLOCK_BASE_URL || "http://localhost:8080",
  middleware: [
    {
      pre: async (context) => {
        if (context.init.body) {
          context.init.headers = {
            ...context.init.headers,
            "Content-Type": "application/json",
          };
        }
        return context;
      },
    },
  ],
  fetchApi: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
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
      agent:
        process.env.SHERLOCK_BASE_URL?.startsWith("https://") &&
        process.env.SHERLOCK_BASE_URL?.endsWith(".local")
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
    } as RequestInit);
  },
});

export const IapJwtHeader = "x-goog-iap-jwt-assertion";

export function handleIAP(request: Request): RequestInit {
  if (request.headers.has(IapJwtHeader)) {
    // Request looks like post-IAP, so forward the header
    return { headers: { [IapJwtHeader]: request.headers.get(IapJwtHeader)! } };
  }
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.SHERLOCK_BASE_URL?.startsWith("https") &&
    process.env.IAP_TOKEN
  ) {
    // Not in production mode, talking to a real instance, and we were given a token, so use it
    return { headers: { Authorization: `Bearer ${process.env.IAP_TOKEN}` } };
  }
  return {};
}
