import { LoaderArgs } from "@remix-run/node";
import https from "https";
import { forwardIAP } from "~/features/sherlock/sherlock.server";

// IAP pass-through to ArgoCD's /badge endpoint. This endpoint on ArgoCD doesn't
// require any authentication, but we wrap it in IAP so we actually do still
// want to pass credentials. ArgoCD responds with wildcard CORS headers because
// it thinks there's no authentication on this endpoint, but that prevents us
// from doing a credentialed CORS AJAX request through IAP, so we just do it
// from Beehive's backend.
// Similar for pass-through to Sherlock, it's important that ARGOCD_BASE_URL be
// set to enable in-cluster communication.
export async function loader({ request }: LoaderArgs) {
  return fetch(
    `${
      process.env.ARGOCD_BASE_URL ||
      "https://ap-argocd.dsp-devops.broadinstitute.org"
    }/api/badge?name=${new URL(request.url).searchParams.get("name")}`,
    {
      ...forwardIAP(request),
      // We don't do TLS hostname validation when the hostname is in the
      // same cluster and is using TLS.
      // @ts-expect-error
      agent:
        process.env.ARGOCD_BASE_URL?.startsWith("https://") &&
        process.env.ARGOCD_BASE_URL?.endsWith(".local")
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
    }
  );
}