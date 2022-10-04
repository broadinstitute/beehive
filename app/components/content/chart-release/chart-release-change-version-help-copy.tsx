export const ChartReleaseChangeVersionHelpCopy: React.FunctionComponent =
  () => (
    <>
      <p>
        This screen lets you change the versions of a specific chart instance.
      </p>
      <p>
        When you click the button at the bottom, changes won't be applied
        immediately—you'll be taken to a screen where you'll review the changes
        before confirming.
      </p>
      <br />
      <br />
      <p>
        You might see some references to "refreshing" or "calculating" versions
        on this screen. That's what we call the process where our tooling looks
        at all the versions we know about and figures out what to use.
      </p>
      <p>
        If you specify an exact version, then our tooling doesn't need to work
        very hard—it just uses that exact version and moves on.
      </p>
      <p>
        If you specify an app branch, or the latest chart, then it has to work a
        bit harder. Each time you calculate verions by clicking the button at
        the bottom—<i>even if you didn't change anything on this page</i>—our
        systems will go looking for the most recent match. It saves the answer
        and will hold on to it until you come back and refresh things again.
      </p>
    </>
  );
