import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, Params, useLoaderData } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartColors } from "~/components/content/chart/chart-colors";
import { ChartDetails } from "~/components/content/chart/chart-details";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Branch } from "~/components/route-tree/branch";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}`}>{params.chartName}</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.chartName} - Chart`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsSelectorGet(
      { selector: params.chartName || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartNameRoute: React.FunctionComponent = () => {
  const chart = useLoaderData<V2controllersChart>();
  return (
    <Branch>
      <OutsetPanel {...ChartColors}>
        <ItemDetails
          subtitle={`Helm Chart from ${chart.chartRepo}`}
          title={chart.name || ""}
        >
          <ChartDetails
            chart={chart}
            toChartVersions="./chart-versions"
            toAppVersions="./app-versions"
            toChartReleases="./chart-releases"
            toEdit="./edit"
            toDelete="./delete"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ chart }} />
    </Branch>
  );
};

export default ChartNameRoute;
