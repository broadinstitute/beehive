import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ClustersApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ClustersApi(SherlockConfiguration)
    .apiClustersV3SelectorGet(
      { selector: params["*"] || "" },
      handleIAP(request),
    )
    .then(
      (cluster) => redirect(`/clusters/${cluster.name}`),
      makeErrorResponseReturner(),
    );
}
