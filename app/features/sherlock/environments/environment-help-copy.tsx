export const EnvironmentHelpCopy: React.FunctionComponent = () => (
  <>
    <p>We have three types of environments: BEE, BEE template, and static.</p>
    <p>
      A <b className="font-semibold">BEE</b> is a Branch Engineering
      Environment. The Interactive Analysis team has some{" "}
      <b className="font-semibold">
        <a
          className="decoration-color-link-underline underline"
          href="https://broadworkbench.atlassian.net/wiki/spaces/IA/pages/2839576631/How+to+BEE"
          target="_blank"
          rel="noreferrer"
        >
          docs for setting up and using BEEs here ↗
        </a>
      </b>
      . You'll probably need those instructions for setting up a new BEE.
    </p>
    <p>
      A <b className="font-semibold">BEE template</b> is where all the
      configuration for a BEE comes from.
    </p>
    <p>
      A <b className="font-semibold">static environment</b> is high-performance,
      heavily-monitored, and backed by a full set of DevOps-managed cloud
      assets. This is what we use for Terra production.
    </p>
  </>
);
