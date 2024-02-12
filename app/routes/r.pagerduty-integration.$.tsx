import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiPagerdutyIntegrationsV3SelectorGet(
      { selector: params["*"] || "" },
      handleIAP(request),
    )
    .then(
      (pagerdutyIntegration) =>
        redirect(`/pagerduty-integrations/${pagerdutyIntegration.pagerdutyID}`),
      makeErrorResponseReturner(),
    );
}
