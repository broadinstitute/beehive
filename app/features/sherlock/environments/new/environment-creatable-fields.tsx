import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { SetsSidebarProps } from "~/hooks/use-sidebar";
import { EnvironmentColors } from "../environment-colors";
import { SidebarSelectEnvironment } from "../set/sidebar-select-environment";

export interface EnvironmentCreatableFieldsProps {
  environment?:
    | V2controllersEnvironment
    | SerializeFrom<V2controllersEnvironment>;
  templateEnvironments: SerializeFrom<V2controllersEnvironment[]>;
  lifecycle: string;
  setLifecycle: (value: string) => void;
  templateEnvironment: string;
  setTemplateEnvironment: (value: string) => void;
}

export const EnvironmentCreatableFields: React.FunctionComponent<
  EnvironmentCreatableFieldsProps & SetsSidebarProps
> = ({
  setSidebarFilterText,
  setSidebar,

  environment,
  templateEnvironments,
  lifecycle,
  setLifecycle,
  templateEnvironment,
  setTemplateEnvironment,
}) => {
  const [autoPopulateChartReleases, setAutoPopulateChartReleases] = useState(
    environment?.autoPopulateChartReleases != null
      ? environment.autoPopulateChartReleases.toString()
      : "true"
  );
  const [base, setBase] = useState(environment?.base || "");
  const [name, setName] = useState(environment?.name || "");

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="font-light text-2xl">Type</h2>
        <EnumInputSelect
          name="lifecycle"
          className="grid grid-cols-2 mt-2"
          fieldValue={lifecycle}
          setFieldValue={(value) => {
            if (value === "dynamic") {
              setBase("");
              setSidebar(({ filterText }) => (
                <SidebarSelectEnvironment
                  environments={templateEnvironments}
                  title="Select Template"
                  fieldValue={filterText}
                  setFieldValue={(value) => {
                    setTemplateEnvironment(value);
                    setSidebar();
                  }}
                />
              ));
            } else {
              setTemplateEnvironment("");
              setSidebar();
              if (value === "template") {
                setBase("bee");
              }
            }
            setLifecycle(value);
          }}
          enums={[
            ["BEE", "dynamic"],
            ["BEE Template", "template"],
            // Soft-prevent creating a static environment through the UI, use ?lifecycle=static instead
            // ["Static", "static"],
          ]}
          {...EnvironmentColors}
        />
      </div>
      <div className="pl-6 border-l-2 border-color-divider-line flex flex-col">
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
              className="underline decoration-color-link-underline"
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
            For a BEE template, you'll almost always want to keep the default of
            "bee" here so you inherit the configuration that makes BEEs work.
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
            onChange={(e) => {
              setTemplateEnvironment(e.currentTarget.value);
              setSidebarFilterText(e.currentTarget.value);
            }}
            onFocus={() => {
              setSidebar(({ filterText }) => (
                <SidebarSelectEnvironment
                  environments={templateEnvironments}
                  title="Select Template"
                  fieldValue={filterText}
                  setFieldValue={(value) => {
                    setTemplateEnvironment(value);
                    setSidebar();
                  }}
                />
              ));
            }}
          />
        </label>
        {lifecycle !== "static" && (
          <div className="mb-4">
            {lifecycle === "dynamic" && (
              <>
                <h2 className="font-light text-2xl">
                  Copy Charts From Template?
                </h2>
                <p>
                  When this is enabled, creating this new BEE will also
                  immediately create instances of all the charts that the
                  template has.
                </p>
              </>
            )}
            {lifecycle === "template" && (
              <>
                <h2 className="font-light text-2xl">
                  Start With Default Charts?
                </h2>
                <p>
                  When this is enabled, this template will start off with a
                  DevOps-configured set of default charts that are usually
                  needed for BEEs to work.
                </p>
              </>
            )}
            <EnumInputSelect
              name="autoPopulateChartReleases"
              className="grid grid-cols-2 mt-2"
              fieldValue={autoPopulateChartReleases}
              setFieldValue={setAutoPopulateChartReleases}
              enums={[
                ["Enabled", "true"],
                ["Disabled", "false"],
              ]}
              {...EnvironmentColors}
            />
          </div>
        )}
        <label className={lifecycle === "static" ? "mb-4" : "hidden"}>
          <h2 className="font-light text-2xl">Namespace</h2>
          <p>
            This is the namespace that chart instances will be created in
            (regardless of cluster).
          </p>
          <TextField
            name="defaultNamespace"
            placeholder={`terra-${name || "(name)"}`}
            defaultValue={environment?.defaultNamespace}
          />
        </label>
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
            value={name}
            pattern="[a-z0-9]([-a-z0-9]*[a-z0-9])?"
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </label>
      </div>
    </div>
  );
};
