export const PagerdutyIntegrationGeneralLinkDescription: React.FunctionComponent =
  () => (
    <>
      <p>
        The button below will let you connect PagerDuty services to Beehive and
        Sherlock. Any services you select will have integrations created for
        them and saved to Sherlock's database.
      </p>
      <p>
        Sherlock is smart enough to "upsert" based on the unique PagerDuty ID of
        each service. This means it's totally okay to select services that
        Sherlock already has stored (maybe you see them in the list to the
        left).
      </p>
      <p>
        If you connect a PagerDuty service that was already connected to
        Sherlock, Sherlock will go ahead and update its records to match
        whatever the latest info from PagerDuty is.
      </p>
      <p>
        For example, if the name of a PagerDuty service had changed and you
        connected it again with the button below, Sherlock would note the
        updated name. Existing chart releases or environments associated to that
        integration in Sherlock's database would stay associated.
      </p>
      <p>
        If you need to actually remove an integration, the right way to do that
        is to click on it in the list to the left and use the delete button
        there. That'll delete it from Sherlock but not touch PagerDuty itself.
      </p>
    </>
  );
