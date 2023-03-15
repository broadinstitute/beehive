import { SerializeFrom } from "@remix-run/node";
import { V2controllersEditableUser } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { UserColors } from "../user-colors";

export const UserEditableFields: React.FunctionComponent<{
  user?: V2controllersEditableUser | SerializeFrom<V2controllersEditableUser>;
}> = ({ user }) => {
  const [nameInferredFromGithub, setNameInferredFromGithub] = useState(
    user?.nameInferredFromGithub != null
      ? user.nameInferredFromGithub.toString()
      : "true"
  );
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-light text-2xl">Get Name From GitHub Profile?</h2>
        <p>
          Our platform tries to keep track of everyone's names, nicknames, or
          usernames to help identify you to other folks in Beehive.
        </p>
        <p className="mt-2">
          This field isn't intentionally shown publicly outside of our platform,
          but it isn't considered sensitive by our systems either, so it could
          potentially get logged.
        </p>
        <p className="mt-2">
          By default, our systems will keep your name here consistent with the
          name on your GitHub profile. You can change that behavior here if
          you'd like.
        </p>
        <EnumInputSelect
          name="nameInferredFromGithub"
          className="grid grid-cols-2 mt-2"
          fieldValue={nameInferredFromGithub}
          setFieldValue={setNameInferredFromGithub}
          enums={[
            ["Yes", "true"],
            ["No", "false"],
          ]}
          {...UserColors}
        />
      </div>
      <div className="pl-6 border-l-2 border-color-divider-line flex flex-col gap-4">
        {nameInferredFromGithub === "true" ? (
          <p>
            When you save, Beehive will take a second to synchronously re-link
            your GitHub to make sure your name is up to date. You can edit your
            GitHub profile name{" "}
            <a
              className="underline decoration-color-link-underline"
              target="_blank"
              href="https://github.com/settings/profile"
            >
              here
            </a>
            .
          </p>
        ) : (
          <label>
            <h2 className="font-light text-2xl">Name</h2>
            <TextField name="name" defaultValue={user?.name} />
          </label>
        )}
      </div>
    </div>
  );
};
