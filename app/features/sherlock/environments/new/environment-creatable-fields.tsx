import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { SetsSidebarProps } from "~/hooks/use-sidebar";
import { EnvironmentColors } from "../environment-colors";
import { SidebarSelectEnvironment } from "../set/sidebar-select-environment";

function templateEnvironmentListDecorator(
  entry: SerializeFrom<V2controllersEnvironment>,
): string | undefined {
  if (entry.name === "swatomation") {
    return "Good Default!";
  }
}

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
  const [name, setName] = useState(environment?.name || "");

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="font-light text-2xl text-color-header-text">Type</h2>
        <EnumInputSelect
          name="lifecycle"
          className="grid grid-cols-2 mt-2"
          fieldValue={lifecycle}
          setFieldValue={(value) => {
            if (value === "dynamic") {
              setSidebar(({ filterText }) => (
                <SidebarSelectEnvironment
                  environments={templateEnvironments}
                  title="Select Template"
                  fieldValue={filterText}
                  setFieldValue={(value) => {
                    setTemplateEnvironment(value);
                    setSidebar();
                  }}
                  extraTextGenerator={templateEnvironmentListDecorator}
                />
              ));
            } else {
              setTemplateEnvironment("");
              setSidebar();
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
        <label className={lifecycle !== "dynamic" ? "hidden" : "mb-4"}>
          <h2 className="font-light text-2xl text-color-header-text">
            Template
          </h2>
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
                  extraTextGenerator={templateEnvironmentListDecorator}
                />
              ));
            }}
          />
        </label>
        <label className={lifecycle === "static" ? "mb-4" : "hidden"}>
          <h2 className="font-light text-2xl text-color-header-text">
            Namespace
          </h2>
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
          <h2 className="font-light text-2xl text-color-header-text">Name</h2>
          <p>{`The name of this new environment. ${
            lifecycle === "dynamic"
              ? "A unique name will be generated if you leave this blank."
              : ""
          }`}</p>
          <b>
            The name should be all lowercase with hyphen separators ie:
            my-new-environment
          </b>
          <TextField
            name="name"
            placeholder={
              lifecycle === "dynamic" ? "(can be left blank)" : "(required)"
            }
            required={lifecycle !== "dynamic"}
            value={name}
            title="Name should be lowercase and alphanumeric with hyphen separators"
            pattern="[a-z0-9]([\-a-z0-9]*[a-z0-9])?"
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </label>
      </div>
    </div>
  );
};
