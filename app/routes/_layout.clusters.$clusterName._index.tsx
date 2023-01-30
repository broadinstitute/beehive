import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { ClusterHelpCopy } from "~/features/sherlock/clusters/cluster-help-copy";

export default function Route() {
  return (
    <InsetPanel largeScreenOnly>
      <FillerText>
        <ClusterHelpCopy />
      </FillerText>
    </InsetPanel>
  );
}
