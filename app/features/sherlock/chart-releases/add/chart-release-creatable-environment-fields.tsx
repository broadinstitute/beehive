import { SerializeFrom } from "@remix-run/node";
import { V2controllersCluster } from "@sherlock-js-client/sherlock";
import React, { useState } from "react";
import { TextField } from "~/components/interactivity/text-field";
import { SidebarSelectCluster } from "../../clusters/set/sidebar-select-cluster";

export const ChartReleaseCreatableEnvironmentFields: React.FunctionComponent<{
  clusters: SerializeFrom<V2controllersCluster[]>;
  setSidebar: (sidebar?: React.ReactNode) => void;

  requireCluster?: boolean;
  initialName: string;
  initialCluster: string;
}> = ({
  clusters,
  setSidebar,
  requireCluster,
  initialName,
  initialCluster,
}) => {
  const [cluster, setCluster] = useState(initialCluster);
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl">Name</h2>
        <p>
          This name should be globally unique for our tooling to work correctly.
          The default below is will work but you can change it if you like.
        </p>
        <TextField
          name="name"
          defaultValue={initialName}
          placeholder={initialName}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">Cluster</h2>
        <p>{`The actual Kubernetes cluster that this chart instance will be deployed to. ${
          requireCluster
            ? ""
            : "This field isn't technically required because this chart instance is in a template."
        }`}</p>
        <TextField
          name="cluster"
          value={cluster}
          onChange={(e) => setCluster(e.currentTarget.value)}
          onFocus={() => {
            setSidebar(
              <SidebarSelectCluster
                clusters={clusters}
                fieldValue={cluster}
                setFieldValue={(value) => {
                  setCluster(value);
                  setSidebar();
                }}
              />
            );
          }}
          required={requireCluster}
          placeholder="Search..."
        />
      </label>
    </div>
  );
};
