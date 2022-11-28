import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { ChartVersionColors } from "./chart-version-colors";

export interface ChartVersionPickerProps {
  isTargetingChangeset?: boolean;
  defaultChartVersionResolver: string;
  chartVersionExact: string;
  setChartVersionExact: (value: string) => void;
  setShowChartVersionExactPicker: (value: boolean) => void;
  defaultHelmfileRef: string;
  hideOtherPickers?: () => void;
}

export const ChartVersionPicker: React.FunctionComponent<
  ChartVersionPickerProps
> = ({
  isTargetingChangeset,
  defaultChartVersionResolver,
  chartVersionExact,
  setChartVersionExact,
  setShowChartVersionExactPicker,
  defaultHelmfileRef,
  hideOtherPickers = () => {},
}) => {
  const [chartVersionResolver, setChartVersionResolver] = useState(
    defaultChartVersionResolver
  );
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h2 className="font-light text-2xl">Specify Chart Version</h2>
        <p>You can change versions later.</p>
        <EnumInputSelect
          name={
            isTargetingChangeset
              ? "toChartVersionResolver"
              : "chartVersionResolver"
          }
          className="grid grid-cols-2 mt-2"
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
      <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col space-y-4">
        {chartVersionResolver === "exact" && (
          <label>
            <h2 className="font-light text-2xl">Set Exact Version</h2>
            <p>
              An exact value will always persist until explicitly changed. It
              won't be affected by refreshes.
            </p>
            <TextField
              name={
                isTargetingChangeset
                  ? "toChartVersionExact"
                  : "chartVersionExact"
              }
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
        <label>
          <h2 className="font-light text-2xl">Helmfile Ref</h2>
          <p>
            This is the Git reference in{" "}
            <a
              href="https://github.com/broadinstitute/terra-helmfile"
              target="_blank"
              className="underline decoration-color-link-underline"
            >
              terra-helmfile
            </a>{" "}
            to use for configuration values.
          </p>
          <TextField
            name={isTargetingChangeset ? "toHelmfileRef" : "helmfileRef"}
            defaultValue={defaultHelmfileRef}
            required
            placeholder="(required)"
          />
        </label>
      </div>
    </div>
  );
};
