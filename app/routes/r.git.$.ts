import { json, LoaderArgs, redirect } from "@remix-run/node";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (chart) =>
        chart.appImageGitRepo
          ? redirect(`https://github.com/${chart.appImageGitRepo}`)
          : json(
              `The ${chart.name} chart doesn't have a git repo recorded, please add it at https://broad.io/beehive/charts/${chart.name}/edit`,
              404
            ),
      makeErrorResponseReturner()
    );
}
