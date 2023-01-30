import { LoaderArgs, redirect } from "@remix-run/node";
import { ClustersApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (cluster) => redirect(`/clusters/${cluster.name}`),
      makeErrorResponseReturner()
    );
}
