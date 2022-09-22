import { DoubleInsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Leaf } from "~/components/route-tree/leaf";

const IndexRoute: React.FunctionComponent = () => (
  <Leaf>
    <DoubleInsetPanel>
      <FillerText title="Charts">
        <p>
          Helm Charts are how we deploy different applications or infrastructure
          components to Kubernetes.
        </p>
        <p>
          Charts themselves always have a Chart Version, and ones that deploy
          applications will have a configurable App Version too.
        </p>
        <p>
          Head over to an Environment or Cluster to work with actual
          configurable instances of Charts, called Chart Releases.
        </p>
      </FillerText>
    </DoubleInsetPanel>
  </Leaf>
);

export default IndexRoute;
