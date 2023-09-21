import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ChartReleaseDeleteDescription } from "~/features/sherlock/chart-releases/delete/chart-release-delete-description";

export const ChartReleaseDeletePanel: React.FunctionComponent<{
  chartRelease: SerializeFrom<V2controllersChartRelease>;
  errorInfo?: SerializeFrom<ReturnedErrorInfo<unknown>>;
}> = ({ chartRelease, errorInfo }) => (
  <OutsetPanel>
    <ActionBox
      title={`Now Deleting ${chartRelease.name}`}
      submitText="Click to Delete"
      {...ChartReleaseColors}
    >
      <ChartReleaseDeleteDescription
        environment={chartRelease.environmentInfo}
      />
      <DeletionGuard name={chartRelease.name} />
      {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
    </ActionBox>
  </OutsetPanel>
);
