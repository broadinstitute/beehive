import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Leaf } from "~/components/route-tree/leaf";

const IndexRoute: React.FunctionComponent = () => (
  <Leaf>
    <InsetPanel>
      <FillerText>
        <p>
          Creating a new chart here lets us track and (attempt) deployments of
          it. It doesn't create the chart files itself.
        </p>
        <p>
          The chart repo needs to be one recognized by DevOps's systems. Contact
          us if you're trying to deploy something external.
        </p>
      </FillerText>
    </InsetPanel>
  </Leaf>
);

export default IndexRoute;
