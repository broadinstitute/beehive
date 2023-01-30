export const ChartReleaseChangeVersionHelpCopy: React.FunctionComponent<{
  chartInstanceName?: string;
}> = ({ chartInstanceName = "sam-dev" }) => (
  <>
    <p>
      Every instance of a chart has two versions: the app version (your code
      itself) and the chart version (the Kubernetes config, which doesn't change
      as often).
    </p>
    <br />
    <p>
      Beehive doesn't just remember those two versions—it remembers what you
      specified and what the result was. This makes more sense with an example:
    </p>
    <p>
      Suppose you set {chartInstanceName}'s app version to v1.2.3. Beehive will
      remember that you set it to exactly v1.2.3, and it'll remember that the
      result was v1.2.3.
    </p>
    <p>
      Or, you could set {chartInstanceName}'s app version to the the git repo's{" "}
      main branch. Beehive will remember that you specified the main branch, and
      when it saves, it'll figure out what the latest actual app version was
      from that branch and store that as the result.{" "}
    </p>
    <p>
      Other advanced ways to specify versions work the same way: the result is
      calculated once and stored.
    </p>
    <br />
    <p>
      In Beehive, you can control what's specified, and when our other tools
      like ArgoCD look at the version, they only see the resulting actual app
      version.
    </p>
    <p>
      That result won't ever change without you knowing, because Beehive only
      refreshes it on-demand, and you'll always be shown a preview first.
    </p>
  </>
);
