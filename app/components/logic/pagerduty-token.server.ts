import type { Session } from "@remix-run/node";
import { sessionFields } from "~/session.server";
import { redirectUrlTokenParameter } from "./pagerduty-token";

const pdAppIDEnvVar = "PAGERDUTY_APP_ID";

export const getPdAppIdFromEnv = (): string => {
  if (process.env[pdAppIDEnvVar]) {
    return process.env[pdAppIDEnvVar];
  } else {
    throw new Error(`No ${pdAppIDEnvVar} in Beehive's environment`);
  }
};

export const verifySessionPagerdutyToken = (
  request: Request,
  session: Session,
) => {
  if (
    !session.has(sessionFields.pdToken) ||
    !session.get(sessionFields.pdToken)
  ) {
    throw new Error(
      "Session did not contain a PD token - this indicates an issue on Beehive's end setting the cookie",
    );
  }

  const requestUrl = new URL(request.url);
  if (
    !requestUrl.searchParams.has(redirectUrlTokenParameter) ||
    !requestUrl.searchParams.get(redirectUrlTokenParameter)
  ) {
    throw new Error(
      "Request URL did not contain the PD token - this indicates an issue on Beehive's end constructing the URL or on PagerDuty's with redirecting to it",
    );
  }

  if (
    session.get(sessionFields.pdToken) !==
    requestUrl.searchParams.get(redirectUrlTokenParameter)
  ) {
    throw new Response(
      "CSRF protection tripped; token in cookie was inconsistent with the token in the redirect URL",
      { status: 422 },
    );
  }
};
