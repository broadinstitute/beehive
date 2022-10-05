import { LoaderFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Branch } from "~/components/route-tree/branch";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ChartReleaseDetails } from "~/components/content/chart-release/chart-release-details";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}`}
    >
      {params.namespace}/{params.chartName}
    </NavLink>
  ),
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorGet(
      {
        selector: `${params.clusterName}/${params.namespace}/${params.chartName}`,
      },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartReleaseRoute: React.FunctionComponent = () => {
  const chartRelease = useLoaderData<V2controllersChartRelease>();
  return (
    <Branch>
      <OutsetPanel {...ChartReleaseColors}>
        <ItemDetails
          subtitle={`Instance of ${chartRelease.chart} in the ${chartRelease.namespace} namespace`}
          title={chartRelease.name || ""}
        >
          <ChartReleaseDetails
            chartRelease={chartRelease}
            toEdit="./edit"
            toDelete="./delete"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ chartRelease }} />
    </Branch>
  );
};

export default ChartReleaseRoute;