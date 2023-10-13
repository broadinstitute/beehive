import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { AppVersionsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new AppVersionsApi(SherlockConfiguration)
    .apiV2AppVersionsSelectorGet(
      { selector: params["*"] || "" },
      handleIAP(request),
    )
    .then(
      (appVersion) =>
        redirect(
          `/charts/${appVersion.chart}/app-versions/${appVersion.appVersion}`,
        ),
      makeErrorResponseReturner(),
    );
}
