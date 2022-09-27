import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { NavButton } from "~/components/interactivity/nav-button";
import { ChartReleaseColors } from "./chart-release";
import { ClusterColors } from "./cluster";
import { DataTypeColors, MutateControls } from "./helpers";

export const EnvironmentColors: DataTypeColors = {
  borderClassName: "border-amber-300",
  backgroundClassName: "bg-amber-50",
};

export interface EnvironmentDetailsProps {
  environment: V2controllersEnvironment;
  toChartReleases?: string | undefined;
  toEdit?: string | undefined;
  toDelete?: string | undefined;
}

export const EnvironmentDetails: React.FunctionComponent<
  EnvironmentDetailsProps
> = ({ environment, toChartReleases, toEdit, toDelete }) => (
  <div className="flex flex-col space-y-10">
    {(toChartReleases ||
      environment.templateEnvironment ||
      environment.defaultCluster) && (
      <div className="flex flex-col space-y-4">
        {toChartReleases && (
          <NavButton
            to={toChartReleases}
            sizeClassName="w-[29vw]"
            {...ChartReleaseColors}
          >
            <h2>View Charts in This Environment</h2>
          </NavButton>
        )}
        {environment.templateEnvironment && (
          <NavButton
            to={`../${environment.templateEnvironment}`}
            sizeClassName="w-[29vw]"
            {...EnvironmentColors}
          >
            <h2>Jump to Template</h2>
          </NavButton>
        )}
        {environment.defaultCluster && (
          <NavButton
            to={`/clusters/${environment.defaultCluster}`}
            sizeClassName="w-[29vw]"
            {...ClusterColors}
          >
            <h2>Jump to Default Cluster</h2>
          </NavButton>
        )}
      </div>
    )}
    {(toEdit || toDelete) && (
      <MutateControls
        name={environment.name || ""}
        colors={EnvironmentColors}
        toEdit={toEdit}
        toDelete={toDelete}
      />
    )}
  </div>
);

export interface EnvironmentDeleteDescriptionProps {
  environment: V2controllersEnvironment;
}

export const EnvironmentDeleteDescription: React.FunctionComponent<
  EnvironmentDeleteDescriptionProps
> = ({ environment }) => (
  <div className="flex flex-col space-y-4">
    <h3 className="text-2xl font-light">
      Are you sure you want to delete this {environment.lifecycle} environment?
    </h3>
    {environment.lifecycle === "dynamic" && (
      <p>
        Since this environment is dynamic, that will cause it to become
        unrendered by Thelma, meaning that the entire deployment will get wiped
        from our infrastructure.
      </p>
    )}
    {environment.lifecycle === "template" && (
      <p>
        Since this environment is a template, any BEEs based on it will continue
        functioning but no new ones will be able to be created.
      </p>
    )}
    {environment.lifecycle === "static" && (
      <p>
        Since this environment is static, all Kubernetes resources will cease
        being rendered by Thelma. There are protections in place that will
        prevent immediate deletion, and Terraform resources like databases will
        be unaffected. You should contact DevOps before proceeding.
      </p>
    )}
    <p>
      This will not delete any associated configuration from our Helm values in{" "}
      <a
        href="https://github.com/broadinstitute/terra-helmfile"
        className="decoration-blue-500 underline"
      >
        terra-helmfile
      </a>
      .
    </p>
    <p>
      After deletion, the name of the environment will remain reserved in
      Sherlock forever. You will not be able to create a new environment with
      the same name.
    </p>
  </div>
);
