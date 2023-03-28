import { LinkChip } from "~/components/interactivity/link-chip";
import { PagerdutyIntegrationColors } from "./pagerduty-integration-colors";

export const PagerdutyIntegrationLinkChip: React.FunctionComponent<{
  to: string;
  pagerdutyIntegrationName: string;
  arrow?: boolean;
}> = ({ to, pagerdutyIntegrationName, arrow }) => (
  <LinkChip
    text={`PagerDuty: ${pagerdutyIntegrationName}`}
    to={to}
    arrow={arrow}
    {...PagerdutyIntegrationColors}
  />
);
