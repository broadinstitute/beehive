import type { SerializeFrom } from "@remix-run/node";
import type { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock";
import { LinkChip } from "~/components/interactivity/link-chip";
import { ServiceAlertColors } from "./service-alert-colors";

export const ServiceAlertLinkChip: React.FunctionComponent<{
  serviceAlert: SherlockServiceAlertV3 | SerializeFrom<SherlockServiceAlertV3>;
  arrow?: boolean;
}> = ({ serviceAlert, arrow }) => (
  <LinkChip
    text={serviceAlert.title || `Service Alert ${serviceAlert.id}`}
    to={`/service-alerts/${serviceAlert.uuid || serviceAlert.id}`}
    arrow={arrow}
    {...ServiceAlertColors}
  />
);
