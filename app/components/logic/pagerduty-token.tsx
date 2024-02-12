import type { Session } from "@remix-run/node";
import { createContext, useEffect, useState } from "react";
import { sessionFields } from "~/session.server";
import { PagerdutyIntegrationColors } from "../../features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import { ExternalNavButton } from "../interactivity/external-nav-button";

export const PagerdutyTokenContext = createContext("");

const pdAppIDEnvVar = "PAGERDUTY_APP_ID";
const redirectUrlTokenParameter = "state";

export const getPdAppIdFromEnv = (): string => {
  if (process.env[pdAppIDEnvVar]) {
    return process.env[pdAppIDEnvVar];
  } else {
    throw new Error(`No ${pdAppIDEnvVar} in Beehive's environment`);
  }
};

export interface PagerdutyInstallLinkProps {
  pdAppID: string;
  dest?: string;
}

export const PagerdutyInstallLink: React.FunctionComponent<
  PagerdutyInstallLinkProps
> = (props) => (
  <PagerdutyTokenContext.Consumer>
    {(token) => <PagerdutyInstallLinkWithToken token={token} {...props} />}
  </PagerdutyTokenContext.Consumer>
);

export interface PagerdutyInstallLinkWithTokenProps
  extends PagerdutyInstallLinkProps {
  token: string;
}

const PagerdutyInstallLinkWithToken: React.FunctionComponent<
  PagerdutyInstallLinkWithTokenProps
> = ({ pdAppID, dest, token }) => {
  const [href, setHref] = useState("");

  useEffect(() => {
    const redirectUrl = new URL(
      window.location.protocol +
        "//" +
        window.location.host +
        "/api/pagerduty/receive-install",
    );
    redirectUrl.searchParams.set(redirectUrlTokenParameter, token);
    if (dest) {
      redirectUrl.searchParams.set("dest", dest);
    }

    const setupUrl = new URL(
      "https://broadinstitute.pagerduty.com/install/integration",
    );
    setupUrl.searchParams.set("app_id", pdAppID);
    setupUrl.searchParams.set("redirect_url", redirectUrl.href);
    setupUrl.searchParams.set("version", "2");

    setHref(setupUrl.href);
  }, [token]);

  return (
    <ExternalNavButton to={href} {...PagerdutyIntegrationColors}>
      Click to Add New PagerDuty Integrations ↗
    </ExternalNavButton>
  );
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
