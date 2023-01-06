import { LinkChip } from "~/components/interactivity/link-chip";
import { EnvironmentColors } from "./environment-colors";

export const EnvironmentLinkChip: React.FunctionComponent<{
  environment: string;
}> = ({ environment }) => (
  <LinkChip
    text={`Environment: ${environment}`}
    to={`/environments/${environment}`}
    {...EnvironmentColors}
  />
);

export const TemplateEnvironmentLinkChip: React.FunctionComponent<{
  environment: string;
}> = ({ environment }) => (
  <LinkChip
    text={`Template: ${environment}`}
    to={`/environments/${environment}`}
    {...EnvironmentColors}
  />
);
