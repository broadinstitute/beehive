import { V2controllersCluster } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { ClusterColors } from "./cluster-colors";

export interface ClusterEditableFieldsProps {
  cluster?: V2controllersCluster;
}

export const ClusterEditableFields: React.FunctionComponent<
  ClusterEditableFieldsProps
> = ({ cluster }) => {
  const [requiresSuitability, setRequiresSuitability] = useState(
    cluster?.requiresSuitability === true ? "true" : "false"
  );
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl">Values Base</h2>
        <p className="mb-2">
          A cluster's configuration is based on two things: the values base
          (this field) and the name.
        </p>
        <p className="mb-2">
          When searching for configuration files, our systems use the values
          base as the directory name as the file name inside{" "}
          <a
            href="https://github.com/broadinstitute/terra-helmfile"
            className="underline decoration-blue-500"
          >
            terra-helmfile
          </a>
          .
        </p>
        <p>
          For example, if a cluster had a base of "my-base" and a name of
          "my-name" and we tried to deploy a copy of the Yale chart, our systems
          would check{" "}
          <span className="font-mono">
            values/cluster/yale/my-base/my-name.yaml
          </span>{" "}
          and any other files along the way.
        </p>
        <TextField
          name="base"
          defaultValue={cluster?.base}
          required
          placeholder="(required)"
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">Address</h2>
        <p>
          The IP address of the Kubernetes Control Plane API. Our tooling
          requires this to know for certain what cluster a name refers to.
        </p>
        <TextField
          name="address"
          defaultValue={cluster?.address}
          required
          placeholder="(required)"
        />
      </label>
      <div>
        <h2 className="font-light text-2xl">Require Suitability?</h2>
        <p>
          DevOps's systems can require production-suitability to <b>modify</b>{" "}
          this cluster (doesn't affect access or cloud provider permissions).
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
          {...ClusterColors}
        />
      </div>
    </div>
  );
};
