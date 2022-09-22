import { Link } from "@remix-run/react";
import { DoubleInsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Leaf } from "~/components/route-tree/leaf";

const IndexRoute: React.FunctionComponent = () => (
  <Leaf>
    <DoubleInsetPanel>
      <FillerText title="Environments">
        <p>
          There are three types of environments we maintain: <b>Static</b>,{" "}
          <b>Template</b>, and <b>Dynamic</b>.
        </p>
        <p>
          <b>Static</b> environments are for production, like{" "}
          <Link
            to="/environments/terra-prod"
            prefetch="intent"
            className="underline decoration-blue-500"
          >
            terra-prod
          </Link>
          , or for production development and testing, like{" "}
          <Link
            to="/environments/terra-dev"
            prefetch="intent"
            className="underline decoration-blue-500"
          >
            terra-dev
          </Link>{" "}
          and{" "}
          <Link
            to="/environments/terra-staging"
            prefetch="intent"
            className="underline decoration-blue-500"
          >
            terra-staging
          </Link>
          . These environments are have Terraform-managed infrastructure and
          monitoring.
        </p>
        <p>
          <b>Template</b> environments exist in our configuration files, but not
          our actual infrastructure. They're one half of what makes BEEs, our
          ephemeral Branch Engineering Environments.
        </p>
        <p>
          <b>Dynamic</b> BEE environments exist in our infrastructure, but not
          individually in our configuration. Dynamic environments borrow their
          configuration from a template—you can say they're instances of a
          template. They're the second half of BEEs, so when someone says
          they're going to start up a BEE, they're creating a new dynamic
          environment.
        </p>
      </FillerText>
    </DoubleInsetPanel>
  </Leaf>
);

export default IndexRoute;
