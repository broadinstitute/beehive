export const EnvironmentHelpCopy: React.FunctionComponent = () => (
  <>
    <p>We have three types of environments: BEE, BEE template, and static.</p>
    <p>
      A <b className="font-semibold">BEE</b> is a Branch Engineering
      Environment. We can automatically set up and tear down BEEs, and they can
      be configured to use whatever versions of apps you like. They get their
      name from their ability to use app versions from an unmerged pull request
      you might have open. The Interactive Analysis team has some{" "}
      <b className="font-semibold">
        {" "}
        more in-depth docs{" "}
        <a
          className="decoration-color-link-underline underline"
          href="https://broadworkbench.atlassian.net/wiki/spaces/IA/pages/2839576631/How+to+BEE"
          target="_blank"
          rel="noreferrer"
        >
          here ↗
        </a>
        .
      </b>
    </p>
    <p>
      A <b className="font-semibold">BEE template</b> is where all the
      configuration for a BEE comes from. They don't actually exist in our
      infrastructure, nothing is actually deployed—they exist just to copy from
      when you create a real BEE.
    </p>
    <p>
      A <b className="font-semibold">static environment</b> is high-performance,
      heavily-monitored, and backed by a full set of DevOps-managed cloud
      assets. This is what we use for Terra production, and we have other static
      environments so we can test infrastructure changes and other things BEEs
      aren't quite suited for.
    </p>
  </>
);
