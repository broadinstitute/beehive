import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ChartsApi(SherlockConfiguration)
    .apiChartsV3SelectorGet({ selector: params["*"] || "" }, handleIAP(request))
    .then(
      (chart) => redirect(`/charts/${chart.name}`),
      makeErrorResponseReturner(),
    );
}
