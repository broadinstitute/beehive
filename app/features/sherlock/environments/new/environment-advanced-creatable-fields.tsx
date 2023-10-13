import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { EnvironmentColors } from "../environment-colors";

export const EnvironmentAdvancedCreatableFields: React.FunctionComponent<{
  environment?:
    | V2controllersEnvironment
    | SerializeFrom<V2controllersEnvironment>;
  lifecycle: string;
}> = ({ environment, lifecycle }) => {
  const [autoPopulateChartReleases, setAutoPopulateChartReleases] = useState(
    environment?.autoPopulateChartReleases != null
      ? environment.autoPopulateChartReleases.toString()
      : "true",
  );
  return (
    <>
      {lifecycle !== "static" && (
        <div className="mb-4">
          {lifecycle === "dynamic" && (
            <>
              <h2 className="font-light text-2xl text-color-header-text">
                Copy Charts From Template?
              </h2>
              <p>
                When this is enabled, creating this new BEE will also
                immediately create instances of all the charts that the template
                has.
              </p>
            </>
          )}
          {lifecycle === "template" && (
            <>
              <h2 className="font-light text-2xl text-color-header-text">
                Start With Default Charts?
              </h2>
              <p>
                When this is enabled, this template will start off with a
                DevOps-configured set of default charts that are usually needed
                for BEEs to work.
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
      {lifecycle !== "dynamic" && (
        <label>
          <h2 className="font-light text-2xl text-color-header-text">
            Values Base
          </h2>
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
          {lifecycle === "template" && (
            <p className="mt-2">
              For a BEE template, you'll almost always want to keep the default
              of "bee" here so you inherit the configuration that makes BEEs
              work.
            </p>
          )}

          <TextField
            name="base"
            required={lifecycle !== "dynamic"}
            placeholder="(required)"
            defaultValue={
              environment?.base ||
              (lifecycle === "template" ? "bee" : undefined)
            }
          />
        </label>
      )}
    </>
  );
};
