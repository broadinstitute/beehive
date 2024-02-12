import type { LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction, Params } from "@remix-run/react";
import { NavLink, useLoaderData } from "@remix-run/react";
import { ChangesetsApi, ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { AppVersionColors } from "~/features/sherlock/app-versions/app-version-colors";
import { DeploymentTimelinePanel } from "~/features/sherlock/changesets/list/deployment-timeline-panel";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => {
    return (
      <NavLink
        to={`/charts/${params.chartName}/app-versions/${params.appVersion}/timeline`}
      >
        Timeline
      </NavLink>
    );
  },
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartName}/${params.appVersion} - App Version - Timeline`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const changesets = await new ChangesetsApi(SherlockConfiguration)
    .apiChangesetsProceduresV3VersionHistoryVersionTypeChartVersionGet(
      {
        chart: params.chartName ?? "",
        version: params.appVersion ?? "",
        versionType: "app",
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
        .apiChartReleasesV3SelectorGet(
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
      colors={AppVersionColors}
    />
  );
}
