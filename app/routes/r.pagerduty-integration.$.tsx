import { LoaderArgs, redirect } from "@remix-run/node";
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiV2PagerdutyIntegrationsSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (pagerdutyIntegration) =>
        redirect(`/pagerduty-integrations/${pagerdutyIntegration.pagerdutyID}`),
      makeErrorResponseReturner()
    );
}
