export const EnvironmentHelpCopy: React.FunctionComponent = () => (
  <>
    <p>We have three types of environments: BEE, BEE template, and static.</p>
    <p>
      A BEE is a Branch Engineering Environment. We can automatically set up and
      tear down BEEs, and they can be configured to use whatever versions of
      apps you like. They get their name from their ability to use app versions
      from an unmerged pull request you might have open.
    </p>
    <p>
      A BEE template is where all the configuration for a BEE comes from. They
      don't actually exist in our infrastructure, nothing is actually
      deployed—they exist just to copy from when you create a real BEE.
    </p>
    <p>
      A static environment is high-performance, heavily-monitored, and backed by
      a full set of DevOps-managed cloud assets. This is what we use for Terra
      production, and we have other static environments so we can test
      infrastructure changes and other things BEEs aren't quite suited for.
    </p>
  </>
);
