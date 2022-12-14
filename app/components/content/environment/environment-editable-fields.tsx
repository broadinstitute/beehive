import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextAreaField } from "~/components/interactivity/text-area-field";
import { TextField } from "~/components/interactivity/text-field";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import { EnvironmentColors } from "./environment-colors";

export interface EnvironmentEditableFieldsProps {
  environment?:
    | V2controllersEnvironment
    | SerializeFrom<V2controllersEnvironment>;
  // When we're creating an environment, we don't want to try to replicate Sherlock's
  // advanced template-default behavior, so this flag tells us to let the user pass
  // empty values for fields where we might otherwise block it.
  creating?: boolean;
  // Further, we can tailor the text we show if we know for certain that a template
  // will get used.
  templateInUse?: boolean;
  defaultCluster: string;
  setDefaultCluster: (value: string) => void;
  setShowDefaultClusterPicker: (value: boolean) => void;
  hideOtherPickers?: () => void;
  // We don't actually *use* this value but it looks slick if we show it to the user
  // as the placeholder for an empty owner field during creation.
  userEmail?: string | null;
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
  const [description, setDescription] = useState(
    environment?.description || ""
  );
  const [preventDeletion, setPreventDeletion] = useState(
    environment?.preventDeletion != null
      ? environment.preventDeletion.toString()
      : "false"
  );
  const extraFields = (
    <>
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
      <label>
        <h2 className="font-light text-2xl">Helmfile Ref</h2>
        <p>
          The git ref of terra-helmfile that should be used for overall
          environment configuration. This doesn't directly configure apps or
          what charts exist; it is used for ArgoCD manifest generation.
        </p>
        <TextField
          name="helmfileRef"
          placeholder={
            templateInUse ? "(defaults to template's value)" : "HEAD"
          }
          defaultValue={environment?.helmfileRef}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">Default Firecloud Develop Ref</h2>
        <p className="mb-2">
          Legacy configuration from firecloud-develop doesn't work quite like
          our newer systems. All the legacy configuration in an environment
          points at the same git ref of firecloud-develop, and during monolith
          release the contents of those refs change to update the configuration.
        </p>
        <p className="mb-2">
          To make this work in Beehive, when you copy versions from one chart
          instance or environment to another, the firecloud-develop ref won't
          actually change. It'll only change if you change it explicitly.
        </p>
        <p>
          This field will set the initial default value for chart instances as
          they get created. This means that a "prod-like BEE" could specify{" "}
          <span className="font-mono">prod</span> here, and any legacy
          configuration inside it would follow that branch by default.
        </p>
        <TextField
          name="defaultFirecloudDevelopRef"
          placeholder={templateInUse ? "(defaults to template's value)" : "dev"}
          defaultValue={environment?.defaultFirecloudDevelopRef}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">Description</h2>
        <p className="mb-2">
          An extra optional note to include for this environment, just for
          display in Beehive.
        </p>
        <p className="mb-2">
          When this field is displayed, links will get automatically generated:
        </p>
        <ul className="list-disc pl-5 mb-2">
          <li>
            Simple Markdown links will work, like
            "[example](https://example.com)"
          </li>
          <li>Text like "[ABC-123]" will become Jira links</li>
        </ul>
        <TextAreaField
          name="description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="(can be left empty)"
          wrap="soft"
        />
      </label>
      {description && (
        <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col space-y-4">
          <p className="w-full">
            Preview: <PrettyPrintDescription description={description} />
          </p>
        </div>
      )}
      {(creating ? templateInUse : environment?.lifecycle === "dynamic") && (
        <div>
          <h2 className="font-light text-2xl">Prevent Deletion?</h2>
          <p>
            This flag prevents auto-deletion of this BEE and also hides the
            delete button in Beehive.
          </p>
          <EnumInputSelect
            name="preventDeletion"
            className="grid grid-cols-2 mt-2"
            fieldValue={preventDeletion}
            setFieldValue={(value) => setPreventDeletion(value)}
            enums={[
              ["Yes", "true"],
              ["No", "false"],
            ]}
            {...EnvironmentColors}
          />
        </div>
      )}
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
          <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col space-y-4">
            {extraFields}
          </div>
        </details>
      ) : (
        extraFields
      )}
    </div>
  );
};
