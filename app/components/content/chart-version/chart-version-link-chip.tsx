import { LinkChip } from "~/components/interactivity/link-chip";
import { ChartVersionColors } from "./chart-version-colors";

export const ChartVersionLinkChip: React.FunctionComponent<{
  chart: string;
  chartVersionExact: string;
}> = ({ chart, chartVersionExact }) => (
  <LinkChip
    text={`Chart Version: ${chartVersionExact}`}
    to={`/charts/${chart}/chart-versions/${chartVersionExact}`}
    {...ChartVersionColors}
  />
);
