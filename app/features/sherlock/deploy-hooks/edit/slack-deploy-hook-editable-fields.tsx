import type { SerializeFrom } from "@remix-run/node";
import type { SherlockSlackDeployHookV3 } from "@sherlock-js-client/sherlock";
import { TextField } from "~/components/interactivity/text-field";

export const SlackDeployHookEditableFields: React.FunctionComponent<{
  existing?: SerializeFrom<SherlockSlackDeployHookV3>;
}> = ({ existing }) => {
  return (
    <label>
      <h2 className="font-light text-2xl">Slack Channel</h2>
      <p className="mb-2">
        You can paste a normal channel name here. The channel needs to be in the
        Broad Institute's Slack workspace.
      </p>
      <p>
        A private channel will work fine, but you'll have to invite @Beehive to
        it.
      </p>
      <TextField
        name="slackChannel"
        required
        placeholder="#workbench-release"
        defaultValue={existing?.slackChannel}
      />
    </label>
  );
};
