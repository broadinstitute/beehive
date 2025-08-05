import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { ServiceAlertHelpCopy } from "~/features/sherlock/service-alerts/service-alert-help-copy";

export default function Route() {
  return (
    <InsetPanel largeScreenOnly size="fill">
      <FillerText title="Service Alerts">
        <ServiceAlertHelpCopy />
      </FillerText>
    </InsetPanel>
  );
}
