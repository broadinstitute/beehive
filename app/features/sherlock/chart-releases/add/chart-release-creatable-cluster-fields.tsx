import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import React, { useState } from "react";
import { TextField } from "~/components/interactivity/text-field";
import { SidebarSelectEnvironment } from "~/features/sherlock/environments/set/sidebar-select-environment";

export const ChartReleaseCreatableClusterFields: React.FunctionComponent<{
  environments: SerializeFrom<V2controllersEnvironment[]>;
  setSidebar: (sidebar?: React.ReactNode) => void;

  initialName: string;
  initialNamespace: string;
  initialEnvironment: string;
}> = ({
  environments,
  setSidebar,
  initialName,
  initialNamespace,
  initialEnvironment,
}) => {
  const [environment, setEnvironment] = useState(initialEnvironment);
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
        <h2 className="font-light text-2xl">Namespace</h2>
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
        <h2 className="font-light text-2xl">Environment</h2>
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
          onChange={(e) => setEnvironment(e.currentTarget.value)}
          onFocus={() => {
            setSidebar(
              <SidebarSelectEnvironment
                environments={environments}
                fieldValue={environment}
                setFieldValue={setEnvironment}
              />
            );
          }}
          placeholder="Search..."
        />
      </label>
    </div>
  );
};
