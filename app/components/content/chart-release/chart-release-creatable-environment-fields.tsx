import { TextField } from "~/components/interactivity/text-field";

export interface ChartReleaseCreatableEnvironmentFieldsProps {
  defaultName: string;
  cluster: string;
  setCluster: (value: string) => void;
  requireCluster: boolean;
  setShowClusterPicker: (value: boolean) => void;
  hideOtherPickers?: () => void;
}

export const ChartReleaseCreatableEnvironmentFields: React.FunctionComponent<
  ChartReleaseCreatableEnvironmentFieldsProps
> = ({
  defaultName,
  cluster,
  setCluster,
  requireCluster,
  setShowClusterPicker,
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
          setShowClusterPicker(true);
          hideOtherPickers();
        }}
        required={requireCluster}
        placeholder="Search..."
      />
    </label>
  </div>
);
