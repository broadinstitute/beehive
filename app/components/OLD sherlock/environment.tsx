import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { FunctionComponent, useEffect, useRef } from "react";
import CheckboxField from "../components/interactivity/checkbox-field";
import LineNavButton from "../common/line-nav-button";
import TextField from "../components/interactivity/text-field";

interface EnvironmentCreatableFieldsProps {
  environment?: V2controllersEnvironment;
}

export const EnvironmentCreatableFields: FunctionComponent<
  EnvironmentCreatableFieldsProps
> = () => (
  <div>
    {/* <label>
      <h3 className="font-light text-2xl">Type</h3>
      <div className="flex flex-row w-full h-12">
        <button className="w-1/3 h-full bg-white">Dynamic BEE</button>
        <button className="w-1/3 h-full bg-white">BEE Template</button>
        <button className="w-1/3 h-full bg-white">Static</button>
      </div>
    </label> */}
  </div>
);

interface EnvironmentEditableFieldsProps {
  environment?: V2controllersEnvironment;
  defaultCluster?: string | undefined;
}

export const EnvironmentEditableFields: FunctionComponent<
  EnvironmentEditableFieldsProps
> = ({ environment, defaultCluster }) => {
  const defaultClusterRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (defaultClusterRef.current != null && defaultCluster != undefined) {
      defaultClusterRef.current.value = defaultCluster;
    }
  }, [defaultCluster]);
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h3 className="font-light text-2xl">Default Cluster</h3>
        <p>
          The cluster that charts in this environment will be deployed to by
          default. Existing charts won't move if this is ever changed.
        </p>
        <div className="w-full flex flex-row">
          <TextField
            name="defaultCluster"
            defaultValue={defaultCluster || environment?.defaultCluster}
            ref={defaultClusterRef}
          />
          <LineNavButton
            to="./select-default-cluster"
            borderClassName="border-green-300"
            sizeClassName="w-[10vw] ml-3 mt-2"
          >
            <h2 className="font-medium">Select →</h2>
          </LineNavButton>
        </div>
      </label>
      <details>
        <summary className="cursor-pointer font-medium">Extra Fields</summary>
        <div className="pt-4 flex flex-col space-y-4">
          <label>
            <h3 className="font-light text-2xl">Default Namespace</h3>
            <p>
              The namespaces that charts in this environment will be deployed to
              by default. If left empty, will default to the name of the
              environment. Existing charts won't move if this is ever changed.
            </p>
            <TextField
              name="defaultNamespace"
              defaultValue={environment?.defaultNamespace}
            />
          </label>
          <label>
            <h3 className="font-light text-2xl">Requires Suitability</h3>
            <p>
              If checked, Sherlock will check the user's production suitability
              before allowing them to mutate this environment or anything
              related to it.
            </p>
            <CheckboxField
              name="requiresSuitability"
              defaultChecked={environment?.requiresSuitability ?? false}
            />
          </label>
          <label>
            <h3 className="font-light text-2xl">Owner</h3>
            <p>
              The email of the user who is responsible for this environment.
              This gets automatically set on creation if left empty.
            </p>
            <TextField name="owner" defaultValue={environment?.owner} />
          </label>
          <label>
            <h3 className="font-light text-2xl">Base Domain</h3>
            <p>
              The base domain that anything in this environment would use for
              its URL. This field is usually only necessary for static or
              template environments, since dynamic ones will borrow the
              template's value.
            </p>
            <TextField
              name="baseDomain"
              defaultValue={environment?.baseDomain}
            />
          </label>
          <label>
            <h3 className="font-light text-2xl">Name Prefixes Domain</h3>
            <p>
              Whether the name of this environment goes in between the base
              domain above and each chart's subdomain in the full URL.
            </p>
            <CheckboxField
              name="namePrefixesDomain"
              defaultChecked={environment?.namePrefixesDomain ?? true}
            />
          </label>
        </div>
      </details>
    </div>
  );
};
