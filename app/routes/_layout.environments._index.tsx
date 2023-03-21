import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { EnvironmentHelpCopy } from "~/features/sherlock/environments/environment-help-copy";

export default function Route() {
  return (
    <InsetPanel largeScreenOnly size="fill">
      <FillerText title="Environments">
        <EnvironmentHelpCopy />
      </FillerText>
    </InsetPanel>
  );
}
