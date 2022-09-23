import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData, useParams } from "@remix-run/react";
import {
  ChartVersionsApi,
  V2controllersChartVersion,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  ChartVersionColors,
  ChartVersionDetails,
} from "~/components/content/chart-version";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Leaf } from "~/components/route-tree/leaf";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink
        to={`/charts/${params.chartName}/chart-versions/${params.chartVersion}`}
      >
        {params.chartVersion}
      </NavLink>
    );
  },
};

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
  return (
    <Leaf>
      <OutsetPanel {...ChartVersionColors}>
        <ItemDetails
          subtitle={`Chart Version of ${chartVersion.chart}`}
          title={chartVersion.chartVersion || ""}
        >
          <ChartVersionDetails chartVersion={chartVersion} />
        </ItemDetails>
      </OutsetPanel>
    </Leaf>
  );
};

export default ChartVersionRoute;
