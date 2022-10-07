import { V2controllersChartVersion } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { TextAreaField } from "~/components/interactivity/text-area-field";
import { PrettyPrintVersionDescription } from "~/components/logic/pretty-print-version-description";

export interface ChartVersionEditableFieldsProps {
  chartVersion?: V2controllersChartVersion;
  repo?: string;
}

export const ChartVersionEditableFields: React.FunctionComponent<
  ChartVersionEditableFieldsProps
> = ({ chartVersion, repo }) => {
  const [description, setDescription] = useState(
    chartVersion?.description || ""
  );
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
          wrap="hard"
        />
      </label>
      <p className="w-full break-all">
        Preview:{" "}
        <PrettyPrintVersionDescription description={description} repo={repo} />
      </p>
    </div>
  );
};
