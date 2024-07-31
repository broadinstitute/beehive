import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockClusterV3,
  SherlockRoleV3,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import type { SetsSidebarProps } from "~/hooks/use-sidebar";
import { SidebarSelectRole } from "../../roles/set/sidebar-select-role";
import { ClusterColors } from "../cluster-colors";

export interface ClusterEditableFieldsProps {
  cluster?: SherlockClusterV3 | SerializeFrom<SherlockClusterV3>;
  roles: SerializeFrom<SherlockRoleV3[]>;
}

export const ClusterEditableFields: React.FunctionComponent<
  ClusterEditableFieldsProps & SetsSidebarProps
> = ({ setSidebarFilterText, setSidebar, cluster, roles }) => {
  const [requiredRole, setRequiredRole] = useState(
    cluster?.requiredRole != null ? cluster.requiredRole : "",
  );
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Values Base
        </h2>
        <p className="mb-2">
          A cluster's configuration is based on two things: the values base
          (this field) and the name.
        </p>
        <p className="mb-2">
          When searching for configuration files, our systems use the values
          base as the directory name as the file name inside{" "}
          <a
            href="https://github.com/broadinstitute/terra-helmfile"
            className="underline decoration-color-link-underline"
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
        <h2 className="font-light text-2xl text-color-header-text">Address</h2>
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
      <label>
        <h2 className="font-light text-2xl text-color-header-text">Location</h2>
        <p>
          Thelma uses the location of the cluster to help specify the proper
          connection name.
        </p>
        <TextField
          name="location"
          placeholder="us-central1-a"
          defaultValue={cluster?.location}
        />
      </label>
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Require Role?
        </h2>
        <p>
          DevOps's systems can require active membership in a specific role to{" "}
          <b className="font-semibold">modify</b> this cluster (doesn't affect
          access).
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
        <h2 className="font-light text-2xl text-color-header-text">
          Helmfile Ref
        </h2>
        <p>
          The git ref of terra-helmfile that should be used for overall cluster
          configuration. This doesn't directly configure apps or what charts
          exist; it is used for ArgoCD manifest generation.
        </p>
        <TextField
          name="helmfileRef"
          placeholder="HEAD"
          defaultValue={cluster?.helmfileRef}
        />
      </label>
    </div>
  );
};
