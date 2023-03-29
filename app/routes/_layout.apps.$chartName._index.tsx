import { LoaderArgs } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import {
  AppVersionsApi,
  ChartsApi,
  ChartVersionsApi,
} from "@sherlock-js-client/sherlock";
import { InsetPanel } from "~/components/layout/inset-panel";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { interleaveVersionPromises } from "~/features/sherlock/interleaved-versions/interleave-version-promises";
import { InterleavedVersionEntry } from "~/features/sherlock/interleaved-versions/interleaved-version-entry";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  const forwardedIAP = forwardIAP(request);

  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsSelectorGet(
      {
        selector: params.chartName ?? "",
      },
      forwardedIAP
    )
    .then((chart) =>
      interleaveVersionPromises(
        new AppVersionsApi(SherlockConfiguration).apiV2AppVersionsGetRaw(
          {
            chart: chart.id?.toString(),
            limit: 10,
            gitBranch: chart.appImageGitMainBranch,
          },
          forwardedIAP
        ),
        new ChartVersionsApi(SherlockConfiguration).apiV2ChartVersionsGetRaw(
          { chart: chart.id?.toString(), limit: 10 },
          forwardedIAP
        ),
        (versions) => versions.slice(0, 10),
        (versions) => {
          const cutOff = new Date();
          cutOff.setDate(cutOff.getDate() - 21);
          return versions.filter(
            (version) =>
              version.version.updatedAt && version.version.updatedAt > cutOff
          );
        }
      )
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const recentVersions = useLoaderData<typeof loader>();
  const { forceShowRecentVersions } = useOutletContext<{
    forceShowRecentVersions: boolean;
  }>();
  return (
    <InsetPanel
      size="one-fourth"
      alwaysShowScrollbar
      largeScreenOnly={!forceShowRecentVersions}
    >
      <InteractiveList
        title="Recent Versions"
        size="one-fourth"
        {...ChartColors}
      >
        {recentVersions.versions.map((entry) => (
          <InterleavedVersionEntry
            entry={entry}
            key={`${entry.type}${entry.version.id}`}
          />
        ))}
      </InteractiveList>
    </InsetPanel>
  );
}
