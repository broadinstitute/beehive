import { LinkChip } from "~/components/interactivity/link-chip";
import { EnvironmentColors } from "./environment-colors";

export const EnvironmentLinkChip: React.FunctionComponent<{
  environment: string;
  justTemplate?: boolean;
  arrow?: boolean;
}> = ({ environment, justTemplate = false, arrow }) => (
  <LinkChip
    text={`${justTemplate ? "Template" : "Environment"}: ${environment}`}
    to={`/environments/${environment}`}
    arrow={arrow}
    {...EnvironmentColors}
  />
);
