import { LoaderFunction, redirect } from "@remix-run/node";
import { AppVersionsApi } from "@sherlock-js-client/sherlock";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  return new AppVersionsApi(SherlockConfiguration)
    .apiV2AppVersionsSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (appVersion) =>
        redirect(
          `/charts/${appVersion.chart}/app-versions/${appVersion.appVersion}`
        ),
      errorResponseReturner
    );
};
