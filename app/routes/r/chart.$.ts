import { LoaderFunction, redirect } from "@remix-run/node";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then((chart) => redirect(`/charts/${chart.name}`), errorResponseReturner);
};
