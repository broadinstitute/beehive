import { TextField } from "~/components/interactivity/text-field";

export interface ChartReleaseCreatableClusterFieldsProps {
  defaultName: string;
  defaultNamespace: string;
  environment: string;
  setEnvironment: (value: string) => void;
  setShowEnvironmentPicker: (value: boolean) => void;
  hideOtherPickers?: () => void;
}

export const ChartReleaseCreatableClusterFields: React.FunctionComponent<
  ChartReleaseCreatableClusterFieldsProps
> = ({
  defaultName,
  defaultNamespace,
  environment,
  setEnvironment,
  setShowEnvironmentPicker,
  hideOtherPickers = () => {},
}) => (
  <div className="flex flex-col space-y-4">
    <label>
      <h2 className="font-light text-2xl">Name</h2>
      <p>
        This name should be globally unique for our tooling to work correctly.
        The default below is will work but you can change it if you like.
      </p>
      <TextField
        name="name"
        defaultValue={defaultName}
        placeholder={defaultName}
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
        defaultValue={defaultNamespace}
      />
    </label>
    <label>
      <h2 className="font-light text-2xl">Environment</h2>
      <p className="mb-2">
        Optionally, attach this new chart instance to a particular environment.
      </p>
      <p className="mb-2">
        <b>
          Heads up that if you're actually trying to just add a chart to an
          environment, you might have an easier time if you go to the
          environment itself in Beehive and add it there.
        </b>
      </p>
      <p>
        Adding it here can work, but adding to a cluster directly is a bit lower
        level and Beehive can't be as helpful with guardrails and default
        behavior.
      </p>
      <TextField
        name="environment"
        value={environment}
        onChange={(e) => setEnvironment(e.currentTarget.value)}
        onFocus={() => {
          setShowEnvironmentPicker(true);
          hideOtherPickers();
        }}
        placeholder="Search..."
      />
    </label>
  </div>
);
