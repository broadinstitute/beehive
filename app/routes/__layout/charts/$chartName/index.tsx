import { ChartHelpCopy } from "~/components/content/chart/chart-help-copy";
import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Leaf } from "~/components/route-tree/leaf";

const IndexRoute: React.FunctionComponent = () => (
  <Leaf>
    <InsetPanel>
      <FillerText>
        <ChartHelpCopy />
      </FillerText>
    </InsetPanel>
  </Leaf>
);

export default IndexRoute;
