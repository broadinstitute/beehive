import { LoaderFunction } from "@remix-run/node";
import { forwardIAP } from "~/helpers/sherlock.server";

// IAP pass-through to ArgoCD's /badge endpoint. This endpoint on ArgoCD doesn't
// require any authentication, but we wrap it in IAP so we actually do still
// want to pass credentials. ArgoCD responds with wildcard CORS headers because
// it thinks there's no authentication on this endpoint, but that prevents us
// from doing a credentialed CORS AJAX request through IAP, so we just do it
// from Beehive's backend.
// Similar for pass-through to Sherlock, it's important that ARGOCD_BASE_URL be
// set to enable in-cluster communication.
export const loader: LoaderFunction = async ({ request }) =>
  fetch(
    `${
      process.env.ARGOCD_BASE_URL ||
      "https://ap-argocd.dsp-devops.broadinstitute.org"
    }/api/badge?name=${new URL(request.url).searchParams.get("name")}`,
    forwardIAP(request)
  );
