import { LoaderArgs, redirect } from "@remix-run/node";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsSelectorGet({ selector: params["*"] || "" }, handleIAP(request))
    .then(
      (chart) => redirect(`/charts/${chart.name}`),
      makeErrorResponseReturner()
    );
}
