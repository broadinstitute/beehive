import { LinkChip } from "~/components/interactivity/link-chip";
import { ChartColors } from "./chart-colors";

export const ChartLinkChip: React.FunctionComponent<{ chart: string }> = ({
  chart,
}) => (
  <LinkChip text={`Chart: ${chart}`} to={`/charts/${chart}`} {...ChartColors} />
);
