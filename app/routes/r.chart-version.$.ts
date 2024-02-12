import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { ChartVersionsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ChartVersionsApi(SherlockConfiguration)
    .apiChartVersionsV3SelectorGet(
      { selector: params["*"] || "" },
      handleIAP(request),
    )
    .then(
      (chartVersion) =>
        redirect(
          `/charts/${chartVersion.chart}/chart-versions/${chartVersion.chartVersion}`,
        ),
      makeErrorResponseReturner(),
    );
}
