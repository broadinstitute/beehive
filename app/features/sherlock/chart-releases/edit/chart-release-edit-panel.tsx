import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import type { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ChartReleaseEditableFields } from "./chart-release-editable-fields";

export const ChartReleaseEditPanel: React.FunctionComponent<{
  chartRelease: SerializeFrom<SherlockChartReleaseV3>;
  errorInfo?: SerializeFrom<ReturnedErrorInfo<SherlockChartReleaseV3>>;
}> = ({ chartRelease, errorInfo }) => (
  <OutsetPanel>
    <ActionBox
      title={`Now Editing ${chartRelease.name}`}
      submitText="Click to Save Edits"
      {...ChartReleaseColors}
    >
      <ChartReleaseEditableFields
        chartExposesEndpoint={chartRelease.chartInfo?.chartExposesEndpoint}
        defaultSubdomain={
          errorInfo?.formState?.subdomain || chartRelease.subdomain
        }
        defaultProtocol={
          errorInfo?.formState?.protocol || chartRelease.protocol
        }
        defaultPort={
          errorInfo?.formState?.port?.toString() ||
          chartRelease.port?.toString()
        }
        baseDomain={
          chartRelease.environmentInfo?.namePrefixesDomain
            ? `${chartRelease.environmentInfo.name}.${chartRelease.environmentInfo.baseDomain}`
            : chartRelease.environmentInfo?.baseDomain
        }
      />
      {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
    </ActionBox>
  </OutsetPanel>
);
