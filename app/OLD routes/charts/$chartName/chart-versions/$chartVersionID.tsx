import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData, useParams } from "@remix-run/react";
import {
  ChartVersionsApi,
  V2controllersChartVersion,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent, useEffect, useRef } from "react";
import ViewPanel from "~/components/OLD panels/view";
import { catchBoundary, errorBoundary } from "~/helpers/boundaries";
import {
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: (routeData: V2controllersChartVersion) => {
    const params = useParams();
    return (
      <NavLink
        to={`/charts/${params.chartName}/chart-versions/${params.chartVersionID}`}
      >
        {routeData.chartVersion}
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartVersionsApi(SherlockConfiguration)
    .apiV2ChartVersionsSelectorGet(
      { selector: params.chartVersionID || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartsChartNameChartVersionsChartVersionIDRoute: FunctionComponent =
  () => {
    const chartVersion: V2controllersChartVersion = useLoaderData();
    const ref = useRef(null);
    useEffect(() => {
      (ref.current as Element | null)?.scrollIntoView();
    }, [chartVersion]);
    return (
      <div className="flex flex-row h-full" ref={ref}>
        <ViewPanel
          title={chartVersion.chartVersion}
          subtitle={`Chart Version of ${chartVersion.chart}`}
          borderClassName="border-violet-300"
        >
          <p>Created at {chartVersion.createdAt}</p>
        </ViewPanel>
      </div>
    );
  };

export default ChartsChartNameChartVersionsChartVersionIDRoute;
