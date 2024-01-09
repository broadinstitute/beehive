import type { SerializeFrom } from "@remix-run/node";
import type { SherlockSlackDeployHookV3 } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { DeployHookColors } from "../deploy-hook-colors";

export const SlackDeployHookEditableFields: React.FunctionComponent<{
  existing?: SerializeFrom<SherlockSlackDeployHookV3>;
}> = ({ existing }) => {
  const [mentionPeople, setMentionPeople] = useState<"true" | "false">(
    existing?.mentionPeople === true ? "true" : "false",
  );
  return (
    <>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Slack Channel
        </h2>
        <p className="mb-2">
          You can paste a normal channel name here. The channel needs to be in
          the Broad Institute's Slack workspace.
        </p>
        <p>
          A private channel will work fine, but you'll have to invite @Beehive
          to it.
        </p>
        <TextField
          name="slackChannel"
          required
          placeholder="#workbench-release"
          defaultValue={existing?.slackChannel}
        />
      </label>
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Mention Users
        </h2>
        <p className="mb-2">
          If enabled, notifications will @-mention the user who initiated the
          deployment as soon as it starts and every user who had a change that
          was released once the deployment is complete.
        </p>
        <p className="mb-2">Be careful with this option as it can be noisy.</p>
        <EnumInputSelect<"true" | "false">
          name="mentionPeople"
          className="grid grid-cols-2 mt-2"
          fieldValue={mentionPeople}
          setFieldValue={setMentionPeople}
          enums={[
            ["Mention People", "true"],
            ["Don't Mention People", "false"],
          ]}
          {...DeployHookColors}
        />
      </div>
    </>
  );
};
