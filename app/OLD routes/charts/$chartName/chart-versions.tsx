import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import {
  ChartVersionsApi,
  V2controllersChartVersion,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundary, errorBoundary } from "~/helpers/boundaries";
import {
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
} from "~/helpers/sherlock.server";
import ListPanel from "~/components/OLD panels/list";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/charts/${params.chartName}/chart-versions`}>
        Chart Versions
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartVersionsApi(SherlockConfiguration)
    .apiV2ChartVersionsGet(
      { chart: params.chartName || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartsChartNameChartVersionsRoute: FunctionComponent = () => {
  const params = useParams();
  const chartVersions: Array<V2controllersChartVersion> = useLoaderData();
  return (
    <div className="flex flex-row h-full">
      <ListPanel
        title={`Chart Versions for ${params.chartName}`}
        entries={chartVersions}
        to={(chartVersion) =>
          `/charts/${params.chartName}/chart-versions/${chartVersion.id}`
        }
        filter={(chartVersion, filter) =>
          chartVersion.chartVersion?.includes(filter)
        }
        borderClassName="border-violet-300"
      >
        {(chartVersion) => (
          <h2 className="font-light">
            {`${params.chartName} Chart @ `}
            {<span className="font-medium">{chartVersion.chartVersion}</span>}
          </h2>
        )}
      </ListPanel>
      <Outlet />
    </div>
  );
};

export default ChartsChartNameChartVersionsRoute;
