import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { NavButton } from "~/components/interactivity/nav-button";
import { EnumSelect } from "../interactivity/enum-select";
import { TextField } from "../interactivity/text-field";
import { ChartReleaseColors } from "./chart-release";
import { ClusterColors } from "./cluster";
import { DataTypeColors, MutateControls } from "./helpers";

export const EnvironmentColors: DataTypeColors = {
  borderClassName: "border-amber-300",
  backgroundClassName: "bg-amber-50",
};

export const EnvironmentHelpCopy: React.FunctionComponent = () => (
  <>
    <p>We have three types of environments: BEE, BEE template, and static.</p>
    <p>
      A BEE is a Branch Engineering Environment. We can automatically set up and
      tear down BEEs, and they can be configured to use whatever versions of
      apps you like. They get their name from their ability to use app versions
      from an unmerged pull request you might have open.
    </p>
    <p>
      A BEE template is where all the configuration for a BEE comes from. They
      don't actually exist in our infrastructure, nothing is actually
      deployed—they exist just to copy from when you create a real BEE.
    </p>
    <p>
      A static environment is high-performance, heavily-monitored, and backed by
      a full set of DevOps-managed cloud assets. This is what we use for Terra
      production, and we have other static environments so we can test
      infrastructure changes and other things BEEs aren't quite suited for.
    </p>
  </>
);

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

export interface EnvironmentCreatableFieldsProps {
  environment?: V2controllersEnvironment | undefined;
  lifecycle: string;
  setLifecycle: (value: string) => void;
  templateEnvironment: string;
  setTemplateEnvironment: (value: string) => void;
  setShowTemplateEnvironmentPicker: (value: boolean) => void;
  // Pass this in so we can disable it when we show the template environment picker
  setShowDefaultClusterPicker: (value: boolean) => void;
}

export const EnvironmentCreatableFields: React.FunctionComponent<
  EnvironmentCreatableFieldsProps
> = ({
  environment,
  lifecycle,
  setLifecycle,
  templateEnvironment,
  setTemplateEnvironment,
  setShowTemplateEnvironmentPicker,
  setShowDefaultClusterPicker,
}) => {
  const [chartReleasesFromTemplate, setChartReleasesFromTemplate] = useState(
    environment?.chartReleasesFromTemplate != null
      ? environment.chartReleasesFromTemplate.toString()
      : "true"
  );
  const [base, setBase] = useState(environment?.base || "");
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="font-light text-2xl">Type</h2>
        <EnumSelect
          name="lifecycle"
          className="grid grid-cols-3"
          fieldValue={lifecycle}
          setFieldValue={(value) => {
            if (value === "dynamic") {
              setBase("");
            } else {
              setShowTemplateEnvironmentPicker(false);
              setTemplateEnvironment("");
            }
            setLifecycle(value);
          }}
          enums={[
            ["BEE", "dynamic"],
            ["BEE Template", "template"],
            ["Static", "static"],
          ]}
          {...EnvironmentColors}
        />
      </div>
      <div className="pl-6 border-l-2 border-zinc-400 flex flex-col">
        <label className={lifecycle === "dynamic" ? "hidden" : "mb-4"}>
          <h2 className="font-light text-2xl">Values Base</h2>
          <p className="mb-2">
            An environment's configuration is based on two things: the values
            base (this field) and the values name (the name of the environment).
          </p>
          <p className="mb-2">
            When searching for configuration files, our systems use the values
            base as the directory name and the values name as the file name
            inside{" "}
            <a
              href="https://github.com/broadinstitute/terra-helmfile"
              className="underline decoration-blue-500"
            >
              terra-helmfile
            </a>
            .
          </p>
          <p>
            For example, if an environment had a base of "my-base" and a name of
            "my-name" and we tried to deploy a copy of the Leonardo chart, our
            systems would check{" "}
            <span className="font-mono">
              values/app/leonardo/my-base/my-name.yaml
            </span>{" "}
            and any other files along the way.
          </p>
          <p className={lifecycle === "template" ? "mt-2" : "hidden"}>
            (Why is this field hidden when making a BEE? They always use the
            values base <i>and even the values name</i> of their template—that's
            how they borrow the template's configuration.)
          </p>
          <TextField
            name="base"
            required={lifecycle !== "dynamic"}
            placeholder="(required)"
            value={base}
            onChange={(e) => setBase(e.currentTarget.value)}
          />
        </label>
        <label className={lifecycle !== "dynamic" ? "hidden" : "mb-4"}>
          <h2 className="font-light text-2xl">Template</h2>
          <p>
            Enter the name of the BEE template that this new BEE will be created
            from.
          </p>
          <TextField
            name="templateEnvironment"
            placeholder="Search..."
            required={lifecycle === "dynamic"}
            value={templateEnvironment}
            onChange={(e) => setTemplateEnvironment(e.currentTarget.value)}
            onFocus={() => {
              setShowTemplateEnvironmentPicker(true);
              setShowDefaultClusterPicker(false);
            }}
          />
        </label>
        <div className={lifecycle !== "dynamic" ? "hidden" : "mb-4"}>
          <h2 className="font-light text-2xl">Copy Charts From Template?</h2>
          <p>
            When this is enabled, creating this new BEE will also immediately
            create instances of all the charts that the template has.
          </p>
          <EnumSelect
            name="chartReleasesFromTemplate"
            className="grid grid-cols-2"
            fieldValue={chartReleasesFromTemplate}
            setFieldValue={setChartReleasesFromTemplate}
            enums={[
              ["Enabled", "true"],
              ["Disabled", "false"],
            ]}
            {...EnvironmentColors}
          />
        </div>
        <label>
          <h2 className="font-light text-2xl">Name</h2>
          <p>{`The name of this new environment. ${
            lifecycle === "dynamic"
              ? "A unique name will be generated if you leave this blank."
              : ""
          }`}</p>
          <TextField
            name="name"
            placeholder={
              lifecycle === "dynamic" ? "(can be left blank)" : "(required)"
            }
            required={lifecycle !== "dynamic"}
          />
        </label>
      </div>
    </div>
  );
};

export interface EnvironmentEditableFieldsProps {
  environment?: V2controllersEnvironment;
  // When we're creating an environment, we don't want to try to replicate Sherlock's
  // advanced template-default behavior, so this flag tells us to let the user pass
  // empty values for fields where we might otherwise block it.
  creating?: boolean | undefined;
  // Further, we can tailor the text we show if we know for certain that a template
  // will get used.
  templateInUse?: boolean | undefined;
  defaultCluster: string;
  setDefaultCluster: (value: string) => void;
  setShowDefaultClusterPicker: (value: boolean) => void;
  // Pass this in so we can disable it when we show the default cluster picker
  setShowTemplateEnvironmentPicker?: (value: boolean) => void | undefined;
  // We don't actually *use* this value but it looks slick if we show it to the user
  // as the placeholder for an empty owner field during creation.
  userEmail?: string | null | undefined;
}

export const EnvironmentEditableFields: React.FunctionComponent<
  EnvironmentEditableFieldsProps
> = ({
  environment,
  creating,
  templateInUse,
  defaultCluster,
  setDefaultCluster,
  setShowDefaultClusterPicker,
  setShowTemplateEnvironmentPicker,
  userEmail,
}) => {
  const [requiresSuitability, setRequiresSuitability] = useState(
    environment?.requiresSuitability != null
      ? environment.requiresSuitability.toString()
      : "false"
  );
  const [namePrefixesDomain, setNamePrefixesDomain] = useState(
    environment?.namePrefixesDomain != null
      ? environment.namePrefixesDomain.toString()
      : templateInUse
      ? ""
      : "true"
  );
  const extraFields = (
    <>
      <label>
        <h2 className="font-light text-2xl">Default Namespace</h2>
        <p>
          The default Kubernetes namespace that charts will be deployed to. If
          left empty, will default to the name of the environment. Existing
          charts won't move if this is ever changed.{" "}
        </p>
        <TextField
          name="defaultNamespace"
          placeholder="(can be left blank)"
          defaultValue={environment?.defaultNamespace}
        />
      </label>
      <div>
        <h2 className="font-light text-2xl">Require Suitability?</h2>
        <p>
          DevOps's systems can require production-suitability to <b>modify</b>{" "}
          this environment (doesn't affect access).
        </p>
        <EnumSelect
          name="requiresSuitability"
          className="grid grid-cols-2"
          fieldValue={requiresSuitability}
          setFieldValue={(value) => setRequiresSuitability(value)}
          enums={[
            ["Yes", "true"],
            ["No", "false"],
          ]}
          {...EnvironmentColors}
        />
      </div>
      <label>
        <h2 className="font-light text-2xl">Owner</h2>
        <p>
          The email of the user who is responsible for this environment. If left
          empty, it will be set to your email.
        </p>
        <TextField
          name="owner"
          placeholder={
            userEmail ||
            (creating ? "(defaults to your email)" : "(can be left blank)")
          }
          defaultValue={environment?.owner}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">Base Domain</h2>
        <p>The base domain for charts deployed in this environment.</p>
        <TextField
          name="baseDomain"
          placeholder={
            templateInUse ? "(defaults to template's value)" : undefined
          }
          defaultValue={
            environment?.baseDomain || templateInUse
              ? undefined
              : "bee.envs-terra.bio"
          }
        />
      </label>
      <div>
        <h2 className="font-light text-2xl">Name Prefixes Domain?</h2>
        <p>
          When multiple environments exist on the same base domain, the name of
          this environment can go in between the base domain and the subdomain
          of each chart.
        </p>
        <EnumSelect
          name="namePrefixesDomain"
          className={templateInUse ? "grid grid-cols-3" : "grid grid-cols-2"}
          fieldValue={namePrefixesDomain}
          setFieldValue={(value) => setNamePrefixesDomain(value)}
          enums={
            templateInUse
              ? [
                  ["Yes", "true"],
                  ["No", "false"],
                  ["Use Template", ""],
                ]
              : [
                  ["Yes", "true"],
                  ["No", "false"],
                ]
          }
          {...EnvironmentColors}
        />
      </div>
    </>
  );
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl">Default Cluster</h2>
        <p>
          The default Kubernetes cluster that charts will be deployed to.
          Existing charts won't move if this is ever changed.
        </p>
        <TextField
          name="defaultCluster"
          placeholder={
            templateInUse ? "(defaults to template's value)" : "Search..."
          }
          value={defaultCluster}
          onChange={(e) => setDefaultCluster(e.currentTarget.value)}
          onFocus={() => {
            setShowDefaultClusterPicker(true);
            if (setShowTemplateEnvironmentPicker) {
              setShowTemplateEnvironmentPicker(false);
            }
          }}
        />
      </label>
      {creating ? (
        <details className="pt-2">
          <summary className="cursor-pointer font-medium">Extra Fields</summary>
          <div className="pl-6 border-l-2 border-zinc-400 mt-4 flex flex-col space-y-4">
            {extraFields}
          </div>
        </details>
      ) : (
        extraFields
      )}
    </div>
  );
};
