import { SerializeFrom } from "@remix-run/node";
import { V2controllersChart } from "@sherlock-js-client/sherlock";
import { GithubLinkChip } from "~/features/github/github-link-chip";
import { ChartLinkChip } from "../chart-link-chip";

export const AppPopoverContents: React.FunctionComponent<{
  chart: SerializeFrom<V2controllersChart>;
}> = ({ chart }) => (
  <>
    <h2 className="font-light text-4xl text-color-header-text">
      Information for <b className="font-semibold">{chart.name}</b>
    </h2>
    <div className="flex flex-row gap-3 flex-wrap pb-2 text-color-body-text">
      {chart.appImageGitRepo && <GithubLinkChip repo={chart.appImageGitRepo} />}
      {chart.name && <ChartLinkChip chart={chart.name} arrow />}
    </div>
  </>
);
