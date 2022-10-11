import { ClusterHelpCopy } from "~/components/content/cluster/cluster-help-copy";
import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Leaf } from "~/components/route-tree/leaf";

const IndexRoute: React.FunctionComponent = () => (
  <Leaf>
    <InsetPanel>
      <FillerText>
        <ClusterHelpCopy />
      </FillerText>
    </InsetPanel>
  </Leaf>
);

export default IndexRoute;
