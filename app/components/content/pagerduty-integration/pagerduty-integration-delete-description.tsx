export const PagerdutyIntegrationDeleteDescription: React.FunctionComponent =
  () => (
    <div className="flex flex-col space-y-4">
      <h3 className="text-2xl font-light">
        Are you sure you want to remove this PagerDuty integration from Sherlock
        and Beehive?
      </h3>
      <p>
        This action won't affect PagerDuty at all, just deletes Sherlock's
        storage of the info. The integration could be added again in the future.
      </p>
      <p>
        This action will fail if there are any chart instances or environments
        that currently reference this integration.
      </p>
    </div>
  );
