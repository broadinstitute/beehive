import { V2controllersChart } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import TextField from "../components/interactivity/text-field";

export const ChartCreatableFields: FunctionComponent = () => (
  <div>
    <label>
      <h3 className="font-light text-2xl">Chart Name</h3>
      <p>
        This is the name of the Helm Chart. Chart names should be short and
        lowercase—digits and hyphens are also allowed.
      </p>
      <TextField name="name" required pattern="[a-z][a-z\-0-9]*[a-z0-9]" />
    </label>
  </div>
);

interface ChartEditableFieldsProps {
  chart?: V2controllersChart;
}

export const ChartEditableFields: FunctionComponent<
  ChartEditableFieldsProps
> = ({ chart }) => (
  <div className="flex flex-col space-y-4">
    <label>
      <h3 className="font-light text-2xl">Chart Repo</h3>
      <p>
        This is the name of the Helm Repo that the tar-balled chart artifacts
        should be downloaded from.
      </p>
      <TextField name="chartRepo" defaultValue={chart?.chartRepo} required />
    </label>
    <label>
      <h2 className="font-light text-2xl">App GitHub Repo</h2>
      <p>
        This is the repo on GitHub that the app's Docker image is built from.
        This should be given in the form <b>organization-name/repo-name</b>.
      </p>
      <TextField
        name="appImageGitRepo"
        defaultValue={chart?.appImageGitRepo}
        pattern="(.+/.+)?"
      />
    </label>
    <label>
      <h2 className="font-light text-2xl">Main Branch</h2>
      <p>
        This is the branch in the above GitHub repo that is stable and intended
        for production. If an instance of this chart is spun up and no version
        of the app is specified, it'll track the versions built from this
        branch.
      </p>
      <TextField
        name="appImageGitMainBranch"
        defaultValue={chart?.appImageGitMainBranch}
      />
    </label>
  </div>
);
