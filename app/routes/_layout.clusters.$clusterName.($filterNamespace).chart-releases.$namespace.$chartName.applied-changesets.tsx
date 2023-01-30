import { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useLoaderData } from "@remix-run/react";
import { ChangesetsApi } from "@sherlock-js-client/sherlock";
import { useMemo } from "react";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { AppliedChangesetsPanel } from "~/features/sherlock/changesets/list/applied-changesets-panel";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { useClusterChartReleaseContext } from "~/routes/_layout.clusters.$clusterName.($filterNamespace).chart-releases.$namespace.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}/applied-changesets`}
    >
      Version History
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance - Version History`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  const url = new URL(request.url);
  const offsetString = url.searchParams.get("offset");
  const offset = offsetString ? parseInt(offsetString) : 0;
  const limitString = url.searchParams.get("limit");
  const limit = limitString ? parseInt(limitString) : 25;
  return Promise.all([
    new ChangesetsApi(SherlockConfiguration)
      .apiV2ProceduresChangesetsQueryAppliedForChartReleaseSelectorGet(
        {
          selector: `${params.clusterName}/${params.namespace}/${params.chartName}`,
          offset: offset,
          limit: limit,
        },
        forwardIAP(request)
      )
      .catch(errorResponseThrower),
    offset,
    limit,
  ]);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [changesets, offset, limit] = useLoaderData<typeof loader>();
  const { chartRelease } = useClusterChartReleaseContext();
  // Our existing chart release has more deeply-nested data than what the API just
  // gave us, and it was repetitive anyway, so we just slot ours in.
  const assembledChangesets = useMemo(() => {
    changesets.forEach((changeset) => {
      changeset.chartReleaseInfo = chartRelease;
    });
    return changesets;
  }, [changesets, chartRelease]);

  return (
    <AppliedChangesetsPanel
      changesets={assembledChangesets}
      offset={offset}
      limit={limit}
      colors={ChartReleaseColors}
    />
  );
}