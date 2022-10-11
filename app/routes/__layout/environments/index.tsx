import { EnvironmentHelpCopy } from "~/components/content/environment/environment-help-copy";
import { DoubleInsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Leaf } from "~/components/route-tree/leaf";

const IndexRoute: React.FunctionComponent = () => (
  <Leaf>
    <DoubleInsetPanel>
      <FillerText title="Environments">
        <EnvironmentHelpCopy />
      </FillerText>
    </DoubleInsetPanel>
  </Leaf>
);

export default IndexRoute;
