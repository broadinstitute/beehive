import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartV3 } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextAreaField } from "~/components/interactivity/text-area-field";
import { TextField } from "~/components/interactivity/text-field";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { ChartColors } from "../chart-colors";

export interface ChartEditableFieldsProps {
  chart?: SherlockChartV3 | SerializeFrom<SherlockChartV3>;
}

export const ChartEditableFields: React.FunctionComponent<
  ChartEditableFieldsProps
> = ({ chart }) => {
  const [showMainBranchBox, setShowMainBranchBox] = useState(
    chart?.appImageGitRepo && chart.appImageGitRepo.length > 0,
  );
  const [chartExposesEndpoint, setChartExposesEndpoint] = useState(
    chart?.chartExposesEndpoint === true ? "true" : "false",
  );
  const [description, setDescription] = useState(chart?.description || "");
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Description
        </h2>
        <p className="mb-2">
          This is the description of this chart/app. It should describe what it
          does and who is responsible for it.
        </p>
        <TextAreaField
          name="description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="(can be left empty)"
          wrap="soft"
        />
      </label>
      {description && (
        <p className="w-full pb-4">
          Preview: <PrettyPrintDescription description={description} />
        </p>
      )}
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Playbook URL
        </h2>
        <p>
          A link to the playbook or emergency documentation for this chart/app.
        </p>
        <TextField
          name="playbookURL"
          defaultValue={chart?.playbookURL}
          pattern="https://.*"
          placeholder="https://..."
        />
      </label>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Chart Repo
        </h2>
        <p>
          This is the name of the Helm Repo that the tar-balled chart artifacts
          should be downloaded from.
        </p>
        <TextField
          name="chartRepo"
          defaultValue={chart?.chartRepo || "terra-helm"}
          required
        />
      </label>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          App GitHub Repo
        </h2>
        <p>
          This is the repo on GitHub that the app's Docker image is built from.
          This should be given in the form <b>organization-name/repo-name</b>.
        </p>
        <TextField
          name="appImageGitRepo"
          defaultValue={chart?.appImageGitRepo}
          pattern="(.+/.+)?"
          placeholder="(can be left empty if there's no app)"
          onChange={(e) => {
            setShowMainBranchBox(e.currentTarget.value.length > 0);
          }}
        />
      </label>
      <div
        className={`pl-6 border-l-2 border-color-divider-line ${
          showMainBranchBox ? "" : "hidden"
        }`}
      >
        <label>
          <h2 className="font-light text-2xl text-color-header-text">
            Main Branch
          </h2>
          <p>
            This is the branch in the above GitHub repo that is stable and
            intended for production. If an instance of this chart is spun up and
            no version of the app is specified, it'll track the versions built
            from this branch.
          </p>
          <TextField
            name="appImageGitMainBranch"
            defaultValue={chart?.appImageGitMainBranch}
            placeholder="(can be left empty if there's no app)"
          />
        </label>
      </div>
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Chart Exposes Web Address?
        </h2>
        <p>
          If this chart hosts some sort of web address, that information can be
          provided here to help automatically generate links.
        </p>
        <EnumInputSelect
          name="chartExposesEndpoint"
          className="grid grid-cols-2 mt-2"
          fieldValue={chartExposesEndpoint}
          setFieldValue={setChartExposesEndpoint}
          enums={[
            ["Yes", "true"],
            ["No", "false"],
          ]}
          {...ChartColors}
        />
      </div>
      <div
        className={`pl-6 border-l-2 border-color-divider-line ${
          chartExposesEndpoint == "true" ? "flex flex-col space-y-4" : "hidden"
        }`}
      >
        <label>
          <h2 className="font-light text-2xl text-color-header-text">
            Default Subdomain
          </h2>
          <p>
            When the app exposes an endpoint, this is the subdomain we assume
            we'll generally make it available at (where the base domain is
            defined by wherever it is deployed)
          </p>
          <TextField
            name="defaultSubdomain"
            defaultValue={chart?.defaultSubdomain}
            placeholder={chart?.name || "(defaults to chart name if omitted)"}
          />
        </label>
        <label>
          <h2 className="font-light text-2xl text-color-header-text">
            Default Protocol
          </h2>
          <p>
            When the app exposes an endpoint, this is protocol it'll be
            available over.
          </p>
          <TextField
            name="defaultProtocol"
            pattern="[a-z]*"
            defaultValue={chart?.defaultProtocol || "https"}
          />
        </label>
        <label>
          <h2 className="font-light text-2xl text-color-header-text">
            Default Port
          </h2>
          <p>
            When the app exposes an endpoint, this is port it'll be available
            on.
          </p>
          <TextField
            name="defaultPort"
            pattern="\d*"
            defaultValue={chart?.defaultPort || "443"}
          />
        </label>
      </div>
    </div>
  );
};
