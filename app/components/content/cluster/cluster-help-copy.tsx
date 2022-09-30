export const ClusterHelpCopy: React.FunctionComponent = () => (
  <>
    <p>
      We have a number of Kubernetes Clusters that we can deploy our Helm Charts
      to.
    </p>
    <p>
      Both Environments and Clusters "contain" instances of our charts, and
      there can be a lot of overlap. For example, an instance of Rawls deployed
      to the terra-prod environment would probably be deployed to the terra-prod
      cluster.
    </p>
    <p>
      There's also cases without overlap. A cluster might contain an instance of
      a chart that ends up getting shared across any environments in that
      cluster—meaning it wouldn't show up as being contained by any particular
      environment. Somewhat similarly, any charts in a template environment
      wouldn't show up as being inside any particular cluster, because template
      environments don't truly exist in our actual infrastructure.
    </p>
  </>
);
