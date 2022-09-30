import { EnumSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { ChartVersionColors } from "./chart-version-colors";

export interface ChartVersionPickerProps {
  chartVersionResolver: string;
  setChartVersionResolver: (value: string) => void;
  chartVersionExact: string;
  setChartVersionExact: (value: string) => void;
  setShowChartVersionExactPicker: (value: boolean) => void;
  hideOtherPickers?: () => void;
}

export const ChartVersionPicker: React.FunctionComponent<
  ChartVersionPickerProps
> = ({
  chartVersionResolver,
  setChartVersionResolver,
  chartVersionExact,
  setChartVersionExact,
  setShowChartVersionExactPicker,
  hideOtherPickers = () => {},
}) => (
  <div className="flex flex-col space-y-4">
    <div>
      <h2 className="font-light text-2xl">Specify Chart Version</h2>
      <EnumSelect
        name="chartVersionResolver"
        className="grid grid-cols-2"
        fieldValue={chartVersionResolver}
        setFieldValue={(value) => {
          setShowChartVersionExactPicker(value === "exact");
          hideOtherPickers();
          setChartVersionResolver(value);
        }}
        enums={[
          ["Exact", "exact"],
          ["Latest", "latest"],
        ]}
        {...ChartVersionColors}
      />
    </div>
    <div className="pl-6 border-l-2 border-zinc-400 mt-4">
      {chartVersionResolver === "exact" && (
        <label>
          <h2 className="font-light text-2xl">Set Exact Version</h2>
          <p>
            An exact value will always persist until explicitly changed. It
            won't be affected by refreshes.
          </p>
          <TextField
            name="chartVersionExact"
            value={chartVersionExact}
            onChange={(e) => setChartVersionExact(e.currentTarget.value)}
            onFocus={() => {
              setShowChartVersionExactPicker(true);
              hideOtherPickers();
            }}
            required
            placeholder="Enter custom value or search..."
          />
        </label>
      )}
      {chartVersionResolver === "latest" && (
        <p>
          Our systems will look for the latest version of the chart
          automatically upon each refresh.
        </p>
      )}
    </div>
  </div>
);
