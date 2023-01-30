import { LoaderArgs, redirect } from "@remix-run/node";
import { ChartVersionsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  return new ChartVersionsApi(SherlockConfiguration)
    .apiV2ChartVersionsSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (chartVersion) =>
        redirect(
          `/charts/${chartVersion.chart}/chart-versions/${chartVersion.chartVersion}`
        ),
      makeErrorResponseReturner()
    );
}
