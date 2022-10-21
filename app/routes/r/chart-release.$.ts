import { LoaderFunction, redirect } from "@remix-run/node";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (chartRelease) =>
        chartRelease.environment
          ? redirect(
              `/environments/${chartRelease.environment}/chart-releases/${chartRelease.chart}`
            )
          : redirect(
              `/clusters/${chartRelease.cluster}/chart-releases/${chartRelease.namespace}/${chartRelease.chart}`
            ),
      errorResponseReturner
    );
};
