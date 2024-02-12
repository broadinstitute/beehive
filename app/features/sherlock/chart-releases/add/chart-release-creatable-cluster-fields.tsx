import type { SerializeFrom } from "@remix-run/node";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";
import React, { useState } from "react";
import { TextField } from "~/components/interactivity/text-field";
import { SidebarSelectEnvironment } from "~/features/sherlock/environments/set/sidebar-select-environment";
import type { SetsSidebarProps } from "~/hooks/use-sidebar";

export const ChartReleaseCreatableClusterFields: React.FunctionComponent<
  {
    environments: SerializeFrom<SherlockEnvironmentV3[]>;

    initialName: string;
    initialNamespace: string;
    initialEnvironment: string;
  } & SetsSidebarProps
> = ({
  setSidebarFilterText,
  setSidebar,
  environments,
  initialName,
  initialNamespace,
  initialEnvironment,
}) => {
  const [environment, setEnvironment] = useState(initialEnvironment);
  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl text-color-header-text">Name</h2>
        <p>
          This name should be globally unique for our tooling to work correctly.
          The default below will work but you can change it if you like.
        </p>
        <TextField
          name="name"
          defaultValue={initialName}
          placeholder={initialName}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Namespace
        </h2>
        <p>
          The namespace in the above cluster that this chart instance will be
          deployed to.
        </p>
        <TextField
          name="namespace"
          required
          placeholder="(required)"
          defaultValue={initialNamespace}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl text-color-header-text">
          Environment
        </h2>
        <p className="mb-2">
          Optionally, attach this new chart instance to a particular
          environment.
        </p>
        <p className="mb-2">
          <b>
            Heads up that if you're actually trying to just add a chart to an
            environment, you might have an easier time if you go to the
            environment itself in Beehive and add it there.
          </b>
        </p>
        <p>
          Adding it here can work, but adding to a cluster directly is a bit
          lower level and Beehive can't be as helpful with guardrails and
          default behavior.
        </p>
        <TextField
          name="environment"
          value={environment}
          onChange={(e) => {
            setEnvironment(e.currentTarget.value);
            setSidebarFilterText(e.currentTarget.value);
          }}
          onFocus={() => {
            setSidebar(({ filterText }) => (
              <SidebarSelectEnvironment
                environments={environments}
                fieldValue={filterText}
                setFieldValue={(value) => {
                  setEnvironment(value);
                  setSidebar();
                }}
              />
            ));
          }}
          placeholder="Search..."
        />
      </label>
    </div>
  );
};
