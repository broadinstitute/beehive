import { ChartHelpCopy } from "~/components/content/chart/chart-help-copy";
import { DoubleInsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Leaf } from "~/components/route-tree/leaf";

const IndexRoute: React.FunctionComponent = () => (
  <Leaf>
    <DoubleInsetPanel>
      <FillerText title="Charts">
        <ChartHelpCopy />
      </FillerText>
    </DoubleInsetPanel>
  </Leaf>
);

export default IndexRoute;
