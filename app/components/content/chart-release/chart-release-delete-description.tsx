import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";

export interface ChartReleaseDeleteDescriptionProps {
  environment?: V2controllersEnvironment;
}

export const ChartReleaseDeleteDescription: React.FunctionComponent<
  ChartReleaseDeleteDescriptionProps
> = ({ environment }) => {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-light">
        Are you sure you want to delete this chart instance?
      </h2>
      <p>
        This won't delete the chart (or app) itself; we'll still be able to
        deploy it in other environments.
      </p>
      {environment?.lifecycle === "template" && (
        <p>
          Note that since this chart instance is in a template environment, it
          doesn't really exist in our infrastructure to begin with. Deleting it
          won't remove it from any existing environments built from this
          template, it just won't be added to new ones.
        </p>
      )}
      <p>
        After deletion, the name of this chart instance will remain reserved in
        Sherlock forever. DevOps can restore chart instances or clear the name
        reservation entirely if necessary.
      </p>
    </div>
  );
};
