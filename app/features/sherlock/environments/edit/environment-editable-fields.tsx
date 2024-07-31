import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockClusterV3,
  SherlockEnvironmentV3,
  SherlockRoleV3,
  SherlockUserV3,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextAreaField } from "~/components/interactivity/text-area-field";
import { TextField } from "~/components/interactivity/text-field";
import { PrettyPrintDescription } from "~/components/logic/pretty-print-description";
import type { SetsSidebarProps } from "~/hooks/use-sidebar";
import { SidebarSelectCluster } from "../../clusters/set/sidebar-select-cluster";
import { SidebarSelectRole } from "../../roles/set/sidebar-select-role";
import { SidebarSelectUser } from "../../users/set/sidebar-select-user";
import { EnvironmentColors } from "../environment-colors";

export interface EnvironmentEditableFieldsProps {
  environment?: SherlockEnvironmentV3 | SerializeFrom<SherlockEnvironmentV3>;
  clusters: SerializeFrom<SherlockClusterV3[]>;
  users: SerializeFrom<SherlockUserV3[]>;
  roles: SerializeFrom<SherlockRoleV3[]>;
  // When we're creating an environment, we don't want to try to replicate Sherlock's
  // advanced template-default behavior, so this flag tells us to let the user pass
  // empty values for fields where we might otherwise block it.
  creating?: boolean;
  // Further, we can tailor the text we show if we know for certain that a template
  // will get used.
  templateInUse?: boolean;
  defaultCluster: string;
  setDefaultCluster: (value: string) => void;
  selfEmail?: string | null;
}

export const EnvironmentEditableFields: React.FunctionComponent<
  EnvironmentEditableFieldsProps & SetsSidebarProps
> = ({
  setSidebarFilterText,
  setSidebar,

  environment,
  clusters,
  users,
  roles,
  creating,
  templateInUse,
  defaultCluster,
  setDefaultCluster,
  selfEmail,
}) => {
  const [enableJanitor, setEnableJanitor] = useState(
    environment?.enableJanitor != null
      ? environment.enableJanitor.toString()
      : // Technically the API does a more complex default operation here if we didn't pass a value
        // (false for static, true for templates, copy template for BEEs) but we optimize for the
        // 99% case here by having UI-created anything default to true. If this component queried
        // the template or something then we could recreate the API's behavior but that's more
        // effort than we need right now.
        "true",
  );
  const [requiredRole, setRequiredRole] = useState(
    environment?.requiredRole != null ? environment.requiredRole : "",
  );
  const [owner, setOwner] = useState(environment?.owner || selfEmail || "");
  const [namePrefixesDomain, setNamePrefixesDomain] = useState(
    environment?.namePrefixesDomain != null
      ? environment.namePrefixesDomain.toString()
      : "true",
  );
  const [description, setDescription] = useState(
    environment?.description || "",
  );
  const [preventDeletion, setPreventDeletion] = useState(
    environment?.preventDeletion != null
      ? environment.preventDeletion.toString()
      : "false",
  );
  return (
    <div className="flex flex-col space-y-4">
      {environment?.name?.includes("prod") || (
        <div>
          <h2 className="font-light text-2xl text-color-header-text">
            Enable Janitor?
          </h2>
          <p>
            The Janitor service helps reduce internal cloud costs in our
            non-production environments by cleaning up resources after a set
            period of time. Chart-level configuration may ignore this field,
            especially for live environments.
          </p>
          {creating || (
            <p className="mt-2">
              Editing this field for an existing environment may not take effect
              immediately or evenly; the entire environment and the generator
              will need to be synced. Feel free to reach out to DevOps for help.
            </p>
          )}
          <EnumInputSelect
            name="enableJanitor"
            className="grid grid-cols-2 mt-2"
            fieldValue={enableJanitor}
            setFieldValue={setEnableJanitor}
            enums={[
              ["Yes", "true"],
              ["No", "false"],
            ]}
            {...EnvironmentColors}
          />
        </div>
      )}
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Require Role?
        </h2>
        <p>
          DevOps's systems can require active membership in a specific role to{" "}
          <b className="font-semibold">modify</b> this environment (doesn't
          affect access).
        </p>
        <TextField
          name="requiredRole"
          placeholder="Search..."
          value={requiredRole}
          onChange={(e) => {
            setRequiredRole(e.currentTarget.value);
            setSidebarFilterText(e.currentTarget.value);
          }}
          onFocus={() => {
            setSidebar(({ filterText }) => (
              <SidebarSelectRole
                roles={roles}
                fieldValue={filterText}
                setFieldValue={(value) => {
                  setRequiredRole(value?.name || "");
                  setSidebar();
                }}
              />
            ));
          }}
        />
      </div>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">Owner</h2>
        <p>
          {`The email of the user who is responsible for this environment. ${
            creating ? "If left empty, it will be set to your email." : ""
          }`}
        </p>
        <TextField
          name="owner"
          placeholder={
            selfEmail || (creating ? "(defaults to your email)" : "Search...")
          }
          value={owner}
          onChange={(e) => {
            setOwner(e.currentTarget.value);
            setSidebarFilterText(e.currentTarget.value);
          }}
          onFocus={() => {
            setSidebar(({ filterText }) => (
              <SidebarSelectUser
                users={users}
                fieldValue={filterText}
                selfEmail={selfEmail ? selfEmail : undefined}
                setFieldValue={(value) => {
                  setOwner(value);
                  setSidebar();
                }}
              />
            ));
          }}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Base Domain
        </h2>
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
        <h2 className="font-light text-2xl text-color-header-text">
          Name Prefixes Domain?
        </h2>
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
        <h2 className="font-light text-2xl text-color-header-text">
          Helmfile Ref
        </h2>
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
        <h2 className="font-light text-2xl text-color-header-text">
          Default Cluster
        </h2>
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
          onChange={(e) => {
            setDefaultCluster(e.currentTarget.value);
            setSidebarFilterText(e.currentTarget.value);
          }}
          onFocus={() => {
            setSidebar(({ filterText }) => (
              <SidebarSelectCluster
                clusters={clusters}
                fieldValue={filterText}
                setFieldValue={(value) => {
                  setDefaultCluster(value);
                  setSidebar();
                }}
                title="Select Default Cluster"
              />
            ));
          }}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Description
        </h2>
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
          <h2 className="font-light text-2xl text-color-header-text">
            Prevent Deletion?
          </h2>
          <p>
            This flag prevents auto-deletion of this BEE and also hides the
            delete and stop functionality in Beehive.
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
    </div>
  );
};
