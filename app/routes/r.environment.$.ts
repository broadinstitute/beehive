import { LoaderArgs, redirect } from "@remix-run/node";
import { EnvironmentsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (environment) => redirect(`/environments/${environment.name}`),
      makeErrorResponseReturner()
    );
}
