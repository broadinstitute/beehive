import { FunctionComponent } from "react";
import PlaceholderPanel from "~/components/OLD panels/placeholder";

const ChartsNewIndexRoute: FunctionComponent = () => (
  <PlaceholderPanel title="New Chart Creation">
    <p>
      You're creating an entry for a new Helm Chart. This isn't a new deployment
      or instance of an existing chart—you're creating an entry in Sherlock for
      a new kind of thing we can deploy.
    </p>
    <p>
      An entry here isn't enough to actually successfully deploy something:
      you'll need to create the chart itself and add it to a Helm Repo for that.
    </p>
    <p>
      Feel free to ask DevOps for help here—this is a pretty rare process for
      most folks.
    </p>
  </PlaceholderPanel>
);

export default ChartsNewIndexRoute;
