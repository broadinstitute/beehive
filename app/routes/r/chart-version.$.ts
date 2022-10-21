import { LoaderFunction, redirect } from "@remix-run/node";
import { ChartVersionsApi } from "@sherlock-js-client/sherlock";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const loader: LoaderFunction = async ({ request, params }) => {
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
      errorResponseReturner
    );
};
