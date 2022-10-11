import { ClusterHelpCopy } from "~/components/content/cluster/cluster-help-copy";
import { DoubleInsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Leaf } from "~/components/route-tree/leaf";

const IndexRoute: React.FunctionComponent = () => (
  <Leaf>
    <DoubleInsetPanel>
      <FillerText title="Clusters">
        <ClusterHelpCopy />
      </FillerText>
    </DoubleInsetPanel>
  </Leaf>
);

export default IndexRoute;
