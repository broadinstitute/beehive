import { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import {
  ChartVersionsApi,
  V2controllersChart,
  V2controllersChartVersion,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartVersionColors } from "~/components/content/chart-version/chart-version-colors";
import { ChartVersionDetails } from "~/components/content/chart-version/chart-version-details";
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
    <NavLink
      to={`/charts/${params.chartName}/chart-versions/${params.chartVersion}`}
    >
      {params.chartVersion}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.chartName}/${params.chartVersion} - Chart Version`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartVersionsApi(SherlockConfiguration)
    .apiV2ChartVersionsSelectorGet(
      { selector: `${params.chartName}/${params.chartVersion}` },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartVersionRoute: React.FunctionComponent = () => {
  const chartVersion = useLoaderData<V2controllersChartVersion>();
  const { chart } = useOutletContext<{ chart: V2controllersChart }>();
  return (
    <Branch>
      <OutsetPanel {...ChartVersionColors}>
        <ItemDetails
          subtitle={`Chart Version of ${chartVersion.chart}`}
          title={chartVersion.chartVersion || ""}
        >
          <ChartVersionDetails chartVersion={chartVersion} toEdit="./edit" />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ chartVersion, chart }} />
    </Branch>
  );
};

export default ChartVersionRoute;
