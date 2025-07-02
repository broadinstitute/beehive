import { LinkChip } from "~/components/interactivity/link-chip";
import { ServiceAlertColors } from "./service-alert-colors";

export const ServiceAlertLinkChip: React.FunctionComponent<{
  role: string;
  arrow?: boolean;
}> = ({ role, arrow }) => (
  <LinkChip
    text={`Role: ${role}`}
    to={`/roles/${role}`}
    arrow={arrow}
    {...ServiceAlertColors}
  />
);
