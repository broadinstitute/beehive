import type { SerializeFrom } from "@remix-run/node";
import type { SherlockUserV3Upsert } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { UserColors } from "../user-colors";

export const UserEditableFields: React.FunctionComponent<{
  user?: SherlockUserV3Upsert | SerializeFrom<SherlockUserV3Upsert>;
}> = ({ user }) => {
  const [nameFrom, setNameFrom] = useState(user?.nameFrom ?? "");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-light text-2xl text-color-header-text">
          How Should We Determine Your Name?
        </h2>
        <p>
          Our platform tries to keep track of everyone's names, nicknames, or
          usernames to help identify you to other folks in Beehive.
        </p>
        <p>
          This field isn't intentionally shown publicly outside of our platform,
          but it isn't considered sensitive by our systems either, so it could
          potentially get logged.
        </p>
        <EnumInputSelect
          name="nameFrom"
          className={user?.nameFrom ? "grid grid-cols-3" : "grid grid-cols-4"}
          fieldValue={nameFrom}
          setFieldValue={setNameFrom}
          enums={
            user?.nameFrom
              ? [
                  ["From Slack", "slack"],
                  ["From GitHub", "github"],
                  ["Custom", "sherlock"],
                ]
              : [
                  ["From Slack", "slack"],
                  ["From GitHub", "github"],
                  ["Custom", "sherlock"],
                  ["(Not Set)", ""],
                ]
          }
          {...UserColors}
        />
      </div>
      <div className="pl-6 border-l-2 border-color-divider-line flex flex-col gap-4">
        {nameFrom === "slack" && (
          <p>
            When you save, Beehive will take a second to synchronously re-link
            your Slack to make sure your name is up to date. It uses the "Full
            Name" field of your Slack profile, which is regularly updated to
            track your "Preferred Name" inside Broad Institute Workday.
          </p>
        )}
        {nameFrom === "github" && (
          <p>
            When you save, Beehive will take a second to synchronously re-link
            your GitHub to make sure your name is up to date. You can edit your
            GitHub profile name{" "}
            <a
              className="underline decoration-color-link-underline"
              target="_blank"
              href="https://github.com/settings/profile"
              rel="noreferrer"
            >
              here
            </a>
            .
          </p>
        )}
        {nameFrom === "sherlock" && (
          <label>
            <h2 className="font-light text-2xl text-color-header-text">Name</h2>
            <TextField name="name" defaultValue={user?.name} />
          </label>
        )}
        {!nameFrom && (
          <p>
            With this field unset, Sherlock will set it automatically if it
            observes a name from either Slack or GitHub.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-light text-2xl text-color-header-text">
          Changing Other Information
        </h2>
        <p>
          If you'd like to change your GitHub or Slack username, you can do that
          through those services. Once that's done, you can click save here and
          Beehive will pick up any changes.
        </p>
        <p>
          If you'd like to change your Broad Institute email address, that's a
          bit more complicated. BITS can add an alias to your email account with
          relative ease, but the original address will still be there (maybe
          that's desirable behavior, maybe it isn't). If you want your actual
          email address itself changed, that's unfortunately a bit of a lift.
          You'd need to contact BITS and DevOps and we'd need to coordinate a
          number of manual changes to keep everything wired up for your
          permissions and access.
        </p>
      </div>
    </div>
  );
};
