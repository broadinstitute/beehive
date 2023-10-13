import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink, Params, useLoaderData } from "@remix-run/react";
import { ChangesetsApi } from "@sherlock-js-client/sherlock";
import { useMemo } from "react";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { VersionHistoryPanel } from "~/features/sherlock/changesets/list/version-history-panel";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { useChartChartReleaseContext } from "~/routes/_layout.charts.$chartName.chart-releases.$chartReleaseName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/applied-changesets`}
    >
      Version History
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Version History`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const offsetString = url.searchParams.get("offset");
  const offset = offsetString ? parseInt(offsetString) : 0;
  const limitString = url.searchParams.get("limit");
  const limit = limitString ? parseInt(limitString) : 25;
  return Promise.all([
    new ChangesetsApi(SherlockConfiguration)
      .apiV2ProceduresChangesetsQueryAppliedForChartReleaseSelectorGet(
        {
          selector: `${params.chartReleaseName}`,
          offset: offset,
          limit: limit,
        },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
    offset,
    limit,
  ]);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [changesets, offset, limit] = useLoaderData<typeof loader>();
  const { chartRelease } = useChartChartReleaseContext();
  // Our existing chart release has more deeply-nested data than what the API just
  // gave us, and it was repetitive anyway, so we just slot ours in.
  const assembledChangesets = useMemo(() => {
    changesets.forEach((changeset) => {
      changeset.chartReleaseInfo = chartRelease;
    });
    return changesets;
  }, [changesets, chartRelease]);

  return (
    <VersionHistoryPanel
      changesets={assembledChangesets}
      offset={offset}
      limit={limit}
      colors={ChartReleaseColors}
    />
  );
}
