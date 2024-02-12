import type { PagerdutyInstallLinkProps } from "~/components/logic/pagerduty-token";
import { PagerdutyInstallLink } from "~/components/logic/pagerduty-token";

export interface LinkPagerdutyFieldsProps extends PagerdutyInstallLinkProps {
  currentIntegrationName?: string;
  selectedPagerdutyID: string;
}

export const LinkPagerdutyFields: React.FunctionComponent<
  LinkPagerdutyFieldsProps
> = ({ currentIntegrationName, selectedPagerdutyID, pdAppID, dest }) => (
  <>
    <p>
      Use the list on the right to select which integration you'd like to link.
      It won't configure any automatic alerts or monitoring, it just allows
      people to manually trigger events through Beehive.
    </p>
    <p className="font-light text-2xl text-color-header-text">
      Selected:{" "}
      <b className="font-medium">{currentIntegrationName || "None"}</b>
    </p>
    <p>
      If the list on the right is missing the PagerDuty service you'd like to
      link to, you can click the link below to add new a integration to Beehive.
      You'll be brought right back here when you're done.
    </p>
    <PagerdutyInstallLink pdAppID={pdAppID} dest={dest} />
    <input
      type="hidden"
      name="pagerdutyIntegration"
      value={selectedPagerdutyID ? `pd-id/${selectedPagerdutyID}` : ""}
    />
  </>
);
