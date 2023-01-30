import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { ChartHelpCopy } from "~/features/sherlock/charts/chart-help-copy";

export default function Route() {
  return (
    <InsetPanel largeScreenOnly doubleWidth>
      <FillerText title="Charts">
        <ChartHelpCopy />
      </FillerText>
    </InsetPanel>
  );
}
