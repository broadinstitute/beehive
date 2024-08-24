import { createContext, useEffect, useState } from "react";
import { PagerdutyIntegrationColors } from "../../features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import { ExternalNavButton } from "../interactivity/external-nav-button";

export const PagerdutyTokenContext = createContext("");

export const redirectUrlTokenParameter = "state";

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
