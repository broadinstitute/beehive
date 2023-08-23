import type { LoaderArgs } from "@remix-run/node";
import type { Params, V2_MetaFunction } from "@remix-run/react";
import { NavLink, useLoaderData } from "@remix-run/react";
import { ChangesetsApi, ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { DeploymentTimelinePanel } from "~/features/sherlock/changesets/list/deployment-timeline-panel";
import { ChartVersionColors } from "~/features/sherlock/chart-versions/chart-version-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => {
    return (
      <NavLink
        to={`/charts/${params.chartName}/chart-versions/${params.chartVersion}/timeline`}
      >
        Timeline
      </NavLink>
    );
  },
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartName}/${params.chartVersion} - chart Version - Timeline`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  const changesets = await new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsQueryAppliedForVersionVersionTypeChartVersionGet(
      {
        chart: params.chartName ?? "",
        version: params.chartVersion ?? "",
        versionType: "chart",
      },
      handleIAP(request),
    )
    .catch(errorResponseThrower);
  const chartReleasesApi = new ChartReleasesApi(SherlockConfiguration);
  return Promise.all(
    changesets.map(async (changeset) => {
      // We need two levels deep, not one like Sherlock gives us by default,
      // so we fill the chartReleaseInfo ourselves with a followup request.
      changeset.chartReleaseInfo = await chartReleasesApi
        .apiV2ChartReleasesSelectorGet(
          {
            selector: changeset.chartRelease || "",
          },
          handleIAP(request),
        )
        .catch(errorResponseThrower);
      return changeset;
    }),
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const changesets = useLoaderData<typeof loader>();

  return (
    <DeploymentTimelinePanel
      changesets={changesets}
      colors={ChartVersionColors}
    />
  );
}
