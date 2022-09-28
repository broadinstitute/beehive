import { V2controllersChart } from "@sherlock-js-client/sherlock";
import React, { useState } from "react";
import { NavButton } from "~/components/interactivity/nav-button";
import { EnumSelect } from "../interactivity/enum-select";
import { TextField } from "../interactivity/text-field";
import { AppVersionColors } from "./app-version";
import { ChartVersionColors } from "./chart-version";
import { DataTypeColors, MutateControls } from "./helpers";

export const ChartColors: DataTypeColors = {
  borderClassName: "border-sky-300",
  backgroundClassName: "bg-sky-50",
};

export const ChartHelpCopy: React.FunctionComponent = () => (
  <>
    <p>
      Helm Charts are how we deploy different applications or infrastructure
      components to Kubernetes.
    </p>
    <p>
      Charts themselves always have a Chart Version, and ones that deploy
      applications will have a configurable App Version too.
    </p>
    <p>
      Head over to an Environment or Cluster to work with actual configurable
      instances of Charts, sometimes called Chart Releases.
    </p>
  </>
);

export interface ChartDetailsProps {
  chart: V2controllersChart;
  toChartVersions?: string | undefined;
  toAppVersions?: string | undefined;
  toEdit?: string | undefined;
  toDelete?: string | undefined;
}

export const ChartDetails: React.FunctionComponent<ChartDetailsProps> = ({
  chart,
  toChartVersions,
  toAppVersions,
  toEdit,
  toDelete,
}) => (
  <div className="flex flex-col space-y-10">
    {chart.appImageGitRepo && (
      <div className="flex flex-col space-y-2">
        <p>This Helm Chart deploys a specific application:</p>
        <a
          href={`https://github.com/${chart.appImageGitRepo}`}
          className="font-light text-4xl decoration-blue-500 underline"
        >
          {chart.appImageGitRepo}
        </a>
        {chart.appImageGitMainBranch && (
          <p>
            The app's stable branch is{" "}
            <a
              href={`https://github.com/${chart.appImageGitRepo}/tree/${chart.appImageGitMainBranch}`}
              className="font-mono decoration-blue-500 underline"
            >
              {chart.appImageGitMainBranch}
            </a>
            .
          </p>
        )}
        {toAppVersions && (
          <NavButton
            to={toAppVersions}
            sizeClassName="w-[29vw]"
            {...AppVersionColors}
          >
            <h2>View App Versions</h2>
          </NavButton>
        )}
      </div>
    )}

    <div className="flex flex-col space-y-2">
      {(chart.chartRepo == "terra-helm" && (
        <div className="flex flex-col space-y-2">
          <p>This Helm Chart's source code is managed by DevOps:</p>
          <a
            href={`https://github.com/broadinstitute/terra-helmfile/charts/${chart.name}`}
            className="font-light text-4xl decoration-blue-500 underline"
          >
            broadinstitute/terra-helmfile
          </a>
          <p>
            The <span className="font-mono">latest</span> version is updated
            automatically upon merges to{" "}
            <a
              href={`https://github.com/broadinstitute/terra-helmfile/tree/master/charts/${chart.name}`}
              className="font-mono decoration-blue-500 underline"
            >
              master
            </a>
            .
          </p>
        </div>
      )) || (
        <p>
          This Helm Chart's source code isn't managed directly by DevOps, but we
          still track the versions we deploy in our systems.
        </p>
      )}
      {toChartVersions && (
        <NavButton
          to={toChartVersions}
          sizeClassName="w-[29vw]"
          {...ChartVersionColors}
        >
          <h2>View Chart Versions</h2>
        </NavButton>
      )}
    </div>
    {(toEdit || toDelete) && (
      <MutateControls
        name={chart.name || ""}
        colors={ChartColors}
        toEdit={toEdit}
        toDelete={toDelete}
      />
    )}
  </div>
);

export const ChartDeleteDescription: React.FunctionComponent = () => (
  <div className="flex flex-col space-y-4">
    <h3 className="text-2xl font-light">
      Are you sure you want to delete this chart?
    </h3>
    <p>
      This will soft-delete it from DevOps's Sherlock source-of-truth service.
      Information about the chart, including chart versions and app versions,
      will become inaccessible.{" "}
      <b>
        Our ability to deploy or maintain instances of the chart will be
        removed.
      </b>
    </p>
    <p>
      This will not delete it from the Helm Repo where tar-balled artifacts are
      stored, or from the Git repo where the source files are stored.
    </p>
    <p>
      After deletion, the name of the chart will remain reserved in Sherlock
      forever. You will not be able to create a new chart with the same name.
    </p>
  </div>
);

export interface ChartCreatableFieldsProps {
  chart?: V2controllersChart | undefined;
}

export const ChartCreatableFields: React.FunctionComponent<
  ChartCreatableFieldsProps
> = ({ chart }) => (
  <div>
    <label>
      <h3 className="font-light text-2xl">Chart Name</h3>
      <p>
        This is the name of the Helm Chart. Chart names should be short and
        lowercase—digits and hyphens are also allowed.
      </p>
      <TextField
        name="name"
        required
        pattern="[a-z][a-z\-0-9]*[a-z0-9]"
        placeholder="(required)"
        defaultValue={chart?.name}
      />
    </label>
  </div>
);

export interface ChartEditableFieldsProps {
  chart?: V2controllersChart | undefined;
}

export const ChartEditableFields: React.FunctionComponent<
  ChartEditableFieldsProps
> = ({ chart }) => {
  const [showMainBranchBox, setShowMainBranchBox] = useState(
    chart?.appImageGitRepo && chart.appImageGitRepo.length > 0
  );
  const [chartExposesEndpoint, setChartExposesEndpoint] = useState(
    chart?.chartExposesEndpoint === true ? "true" : "false"
  );
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl">Chart Repo</h2>
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
        <h2 className="font-light text-2xl">App GitHub Repo</h2>
        <p>
          This is the repo on GitHub that the app's Docker image is built from.
          This should be given in the form <b>organization-name/repo-name</b>.
        </p>
        <TextField
          name="appImageGitRepo"
          defaultValue={chart?.appImageGitRepo}
          pattern="(.+/.+)?"
          placeholder="(can be left empty if there's no app)"
          onBlur={(e) => {
            setShowMainBranchBox(e.currentTarget.value.length > 0);
          }}
        />
      </label>
      <div
        className={`pl-6 border-l-2 border-zinc-400 ${
          showMainBranchBox ? "" : "hidden"
        }`}
      >
        <label>
          <h2 className="font-light text-2xl">Main Branch</h2>
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
        <h2 className="font-light text-2xl">Chart Exposes Endpoint?</h2>
        <p>
          If this chart hosts some sort of web address, that information can be
          provided here to help automatically generate links.
        </p>
        <EnumSelect
          name="chartExposesEndpoint"
          className="grid grid-cols-2"
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
        className={`pl-6 border-l-2 border-zinc-400 ${
          chartExposesEndpoint == "true" ? "flex flex-col space-y-4" : "hidden"
        }`}
      >
        <label>
          <h2 className="font-light text-2xl">Default Subdomain</h2>
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
          <h2 className="font-light text-2xl">Default Protocol</h2>
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
          <h2 className="font-light text-2xl">Default Port</h2>
          <p>
            When the app exposes an endpoint, this is port it'll be available
            on.
          </p>
          <TextField
            name="defaultPort"
            pattern="[0-9]*"
            defaultValue={chart?.defaultPort || "443"}
          />
        </label>
      </div>
    </div>
  );
};
