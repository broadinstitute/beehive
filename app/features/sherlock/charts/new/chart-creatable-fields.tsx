import { SerializeFrom } from "@remix-run/node";
import { SherlockChartV3 } from "@sherlock-js-client/sherlock";
import { TextField } from "~/components/interactivity/text-field";

export interface ChartCreatableFieldsProps {
  chart?: SherlockChartV3 | SerializeFrom<SherlockChartV3>;
}

export const ChartCreatableFields: React.FunctionComponent<
  ChartCreatableFieldsProps
> = ({ chart }) => (
  <div>
    <label>
      <h3 className="font-light text-2xl text-color-header-text">Chart Name</h3>
      <p>
        This is the name of the Helm Chart. Chart names should be short and
        lowercase—digits and hyphens are also allowed.
      </p>
      <TextField
        name="name"
        required
        pattern="[a-z][a-z\-0-9]*[a-z0-9]"
        placeholder="(required)"
        defaultValue={chart?.name}
      />
    </label>
  </div>
);
