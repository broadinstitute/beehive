import { json, LoaderFunction, redirect } from "@remix-run/node";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const loader: LoaderFunction = async ({ request, params }) =>
  new ChartsApi(SherlockConfiguration)
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
      errorResponseReturner
    );
