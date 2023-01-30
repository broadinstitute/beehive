import { LoaderArgs, redirect } from "@remix-run/node";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
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
      makeErrorResponseReturner()
    );
}
