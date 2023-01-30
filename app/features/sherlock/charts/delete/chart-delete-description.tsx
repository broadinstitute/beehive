export const ChartDeleteDescription: React.FunctionComponent = () => (
  <div className="flex flex-col space-y-4">
    <h3 className="text-2xl font-light">
      Are you sure you want to delete this chart?
    </h3>
    <p>
      This will soft-delete it from DevOps's Sherlock source-of-truth service.
      Information about the chart, including chart versions and app versions,
      will become inaccessible.{" "}
      <b>
        Our ability to deploy or maintain instances of the chart will be
        removed.
      </b>
    </p>
    <p>
      This will not delete it from the Helm Repo where tar-balled artifacts are
      stored, or from the Git repo where the source files are stored.
    </p>
    <p>
      After deletion, the name of the chart will remain reserved in Sherlock
      forever. You will not be able to create a new chart with the same name.
    </p>
  </div>
);
