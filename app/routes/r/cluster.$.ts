import { LoaderFunction, redirect } from "@remix-run/node";
import { ClustersApi } from "@sherlock-js-client/sherlock";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (cluster) => redirect(`/clusters/${cluster.name}`),
      errorResponseReturner
    );
};
