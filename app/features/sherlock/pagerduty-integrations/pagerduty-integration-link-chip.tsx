import { LinkChip } from "~/components/interactivity/link-chip";
import { PagerdutyIntegrationColors } from "./pagerduty-integration-colors";

export const PagerdutyIntegrationLinkChip: React.FunctionComponent<{
  to: string;
  pagerdutyIntegrationName: string;
}> = ({ to, pagerdutyIntegrationName }) => (
  <LinkChip
    text={`PagerDuty: ${pagerdutyIntegrationName}`}
    to={to}
    {...PagerdutyIntegrationColors}
  />
);
