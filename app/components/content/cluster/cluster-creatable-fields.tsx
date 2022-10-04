import { V2controllersCluster } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { ClusterColors } from "./cluster-colors";

export interface ClusterCreatableFieldsProps {
  cluster?: V2controllersCluster | undefined;
}

export const ClusterCreatableFields: React.FunctionComponent<
  ClusterCreatableFieldsProps
> = ({ cluster }) => {
  const [provider, setProvider] = useState<string>(
    cluster?.provider || "google"
  );
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl">Name</h2>
        <p>The name of this Kubernetes Cluster.</p>
        <TextField name="name" placeholder="(required)" required />
      </label>
      <div>
        <h2 className="font-light text-2xl">Provider</h2>
        <p>The cloud provider hosting this cluster.</p>
        <EnumInputSelect
          name="provider"
          className="grid grid-cols-2 mt-2"
          fieldValue={provider}
          setFieldValue={setProvider}
          enums={[
            ["Google Cloud", "google"],
            ["Azure", "azure"],
          ]}
          {...ClusterColors}
        />
      </div>
      <label>
        <h2 className="font-light text-2xl">Google Project</h2>
        <p>When applicable, the Google Project related to this cluster.</p>
        <TextField
          name="googleProject"
          required={provider === "google"}
          defaultValue={cluster?.googleProject}
          placeholder={
            provider === "google" ? "(required)" : "(can be left blank)"
          }
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">Azure Subscription</h2>
        <p>When applicable, the Azure Subscription related to this cluster.</p>
        <TextField
          name="azureSubscription"
          required={provider === "azure"}
          defaultValue={cluster?.azureSubscription}
          placeholder={
            provider === "azure" ? "(required)" : "(can be left blank)"
          }
        />
      </label>
    </div>
  );
};
