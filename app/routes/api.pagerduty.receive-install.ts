import { LoaderArgs, redirect } from "@remix-run/node";
import { PagerdutyIntegrationsApi } from "@sherlock-js-client/sherlock";
import { verifySessionPagerdutyToken } from "~/components/logic/pagerduty-token";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { getSession } from "~/session.server";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  verifySessionPagerdutyToken(request, session);

  const requestUrl = new URL(request.url);
  const destination = requestUrl.searchParams.get("dest");
  const encodedConfig = requestUrl.searchParams.get("config");
  if (!encodedConfig) {
    throw new Error("No config in response from PagerDuty");
  }
  const config: {
    integration_keys: Array<{
      integration_key: string;
      name: string;
      id: string;
      type: string;
    }>;
    account: {
      subdomain: string;
      Name: string;
    };
  } = JSON.parse(encodedConfig);
  if (config.integration_keys.length === 0) {
    throw new Error("No keys in response from PagerDuty");
  }

  const sherlock = new PagerdutyIntegrationsApi(SherlockConfiguration);
  await Promise.all(
    config.integration_keys.map((k) =>
      sherlock
        .apiV2PagerdutyIntegrationsSelectorPut(
          {
            selector: `pd-id/${k.id}`,
            pagerdutyIntegration: {
              pagerdutyID: k.id,
              name: k.name,
              key: k.integration_key,
              type: k.type,
            },
          },
          forwardIAP(request)
        )
        .catch(errorResponseThrower)
    )
  ).catch(errorResponseThrower);

  const idToUse =
    config.integration_keys.find((k) => k.type === "service")?.id ||
    config.integration_keys[0]?.id;

  if (destination) {
    return redirect(`${destination}?pd-id=${idToUse}`);
  } else {
    return redirect(`/pagerduty-integrations/${idToUse}`);
  }
}
