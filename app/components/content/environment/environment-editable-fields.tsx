import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { EnvironmentColors } from "./environment-colors";

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
  hideOtherPickers?: () => void;
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
  hideOtherPickers = () => {},
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
        <EnumInputSelect
          name="requiresSuitability"
          className="grid grid-cols-2 mt-2"
          fieldValue={requiresSuitability}
          setFieldValue={setRequiresSuitability}
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
          {`The email of the user who is responsible for this environment. ${
            creating ? "If left empty, it will be set to your email." : ""
          }`}
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
            environment?.baseDomain ||
            (templateInUse ? undefined : "bee.envs-terra.bio")
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
        <EnumInputSelect
          name="namePrefixesDomain"
          className="grid grid-cols-2 mt-2"
          fieldValue={namePrefixesDomain}
          setFieldValue={(value) => setNamePrefixesDomain(value)}
          enums={[
            ["Yes", "true"],
            ["No", "false"],
          ]}
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
            hideOtherPickers();
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
