import { SerializeFrom } from "@remix-run/node";
import { V2controllersAppVersion } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { TextAreaField } from "~/components/interactivity/text-area-field";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";

export interface AppVersionEditableFieldsProps {
  appVersion?: V2controllersAppVersion | SerializeFrom<V2controllersAppVersion>;
  repo?: string;
}

export const AppVersionEditableFields: React.FunctionComponent<
  AppVersionEditableFieldsProps
> = ({ appVersion, repo }) => {
  const [description, setDescription] = useState(appVersion?.description || "");
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl">Description</h2>
        <p className="mb-2">
          This is the description of this version. It should be something short,
          like a Git commit message.
        </p>
        <p className="mb-2">
          When this field is displayed, links will get automatically generated:
        </p>
        <ul className="list-disc pl-5 mb-2">
          <li>
            Simple Markdown links will work, like
            "[example](https://example.com)"
          </li>
          <li>Text like "[ABC-123]" will become Jira links</li>
          {repo ? (
            <li>Text like "(#123)" will become GitHub links to {repo}</li>
          ) : (
            <li>
              There's no GitHub repo configured, so text like "(#123)" will be
              filtered out
            </li>
          )}
        </ul>
        <TextAreaField
          name="description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="(can be left empty)"
          wrap="soft"
        />
      </label>
      <p className="w-full">
        Preview:{" "}
        <PrettyPrintDescription description={description} repo={repo} />
      </p>
    </div>
  );
};