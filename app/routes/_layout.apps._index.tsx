import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";

export default function Route() {
  return (
    <InsetPanel largeScreenOnly size="fill">
      <FillerText title="Apps">
        <p>Select an app to the left to get started</p>
      </FillerText>
    </InsetPanel>
  );
}
