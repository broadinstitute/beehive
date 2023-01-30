import { LoaderArgs, redirect } from "@remix-run/node";
import { AppVersionsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
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
      makeErrorResponseReturner()
    );
}
