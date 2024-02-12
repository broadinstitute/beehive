import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ChartsApi(SherlockConfiguration)
    .apiChartsV3SelectorGet({ selector: params["*"] || "" }, handleIAP(request))
    .then(
      (chart) =>
        chart.appImageGitRepo
          ? redirect(`https://github.com/${chart.appImageGitRepo}`)
          : json(
              `The ${chart.name} chart doesn't have a git repo recorded, please add it at https://broad.io/beehive/charts/${chart.name}/edit`,
              404,
            ),
      makeErrorResponseReturner(),
    );
}
