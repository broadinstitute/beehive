import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { IncidentHelpCopy } from "~/features/sherlock/pagerduty-integrations/trigger-incident/incident-help-copy";

export default function Route() {
  return (
    <InsetPanel largeScreenOnly size="one-third">
      <FillerText title="Trigger Incident">
        <IncidentHelpCopy />
      </FillerText>
    </InsetPanel>
  );
}
