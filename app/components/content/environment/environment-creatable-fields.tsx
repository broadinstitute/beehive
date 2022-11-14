import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { EnvironmentColors } from "./environment-colors";

export interface EnvironmentCreatableFieldsProps {
  environment?: V2controllersEnvironment;
  lifecycle: string;
  setLifecycle: (value: string) => void;
  templateEnvironment: string;
  setTemplateEnvironment: (value: string) => void;
  setShowTemplateEnvironmentPicker: (value: boolean) => void;
  hideOtherPickers?: () => void;
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
  hideOtherPickers = () => {},
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
        <EnumInputSelect
          name="lifecycle"
          className="grid grid-cols-3 mt-2"
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
              hideOtherPickers();
            }}
          />
        </label>
        <div className={lifecycle !== "dynamic" ? "hidden" : "mb-4"}>
          <h2 className="font-light text-2xl">Copy Charts From Template?</h2>
          <p>
            When this is enabled, creating this new BEE will also immediately
            create instances of all the charts that the template has.
          </p>
          <EnumInputSelect
            name="chartReleasesFromTemplate"
            className="grid grid-cols-2 mt-2"
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
