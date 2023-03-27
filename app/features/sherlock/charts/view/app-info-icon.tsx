import { SerializeFrom } from "@remix-run/node";
import { V2controllersChart } from "@sherlock-js-client/sherlock";
import { Info } from "lucide-react";
import { useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { Popover } from "~/components/interactivity/popover";
import { GithubLinkChip } from "~/features/github/github-link-chip";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { ChartLinkChip } from "~/features/sherlock/charts/chart-link-chip";

export const AppInfoIcon: React.FunctionComponent<{
  chart: SerializeFrom<V2controllersChart>;
}> = ({ chart }) => {
  const [open, onOpenChange] = useState(false);
  return (
    <Popover
      open={open}
      size="one-third"
      onOpenChange={onOpenChange}
      openButton={(ref, props) => (
        <ActionButton
          sizeClassName="w-min py-1"
          type="button"
          ref={ref}
          isHovered={open}
          {...ChartColors}
          {...props()}
        >
          <Info className="w-9 h-9 stroke-color-header-text" />
        </ActionButton>
      )}
      {...ChartColors}
    >
      <h2 className="font-light text-4xl text-color-header-text">
        Information for <b className="font-semibold">{chart.name}</b>
      </h2>
      <div className="flex flex-row gap-3 flex-wrap pb-2">
        {chart.appImageGitRepo && (
          <GithubLinkChip repo={chart.appImageGitRepo} />
        )}
        {chart.name && <ChartLinkChip chart={chart.name} arrow />}
      </div>
    </Popover>
  );
};
