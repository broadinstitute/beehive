import { LinkChip } from "~/components/interactivity/link-chip";
import { ChartColors } from "./chart-colors";

export const ChartLinkChip: React.FunctionComponent<{
  chart: string;
  arrow?: boolean;
}> = ({ chart, arrow }) => (
  <LinkChip
    text={`Chart: ${chart}`}
    arrow={arrow}
    to={`/charts/${chart}`}
    {...ChartColors}
  />
);
