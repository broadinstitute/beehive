import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import ListPanel from "~/components/OLD panels/list";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
} from "~/helpers/sherlock.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesGet(
      { environment: params.environmentName || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EnvironmentsEnvironmentNameChartReleasesRoute: FunctionComponent = () => {
  const params = useParams();
  const chartReleases: Array<V2controllersChartRelease> = useLoaderData();
  return (
    <div className="flex flex-row h-full">
      <ListPanel
        title={`Charts in ${params.environmentName}`}
        entries={chartReleases}
        to={(chartRelease) =>
          `/environments/${params.environmentName}/${chartRelease.name}`
        }
        filter={(chartRelease, filter) =>
          chartRelease.chart?.includes(filter) ||
          chartRelease.name?.includes(filter)
        }
        borderClassName="border-sky-300"
      >
        {(chartRelease) => (
          <h2 className="font-medium">{chartRelease.chart}</h2>
        )}
      </ListPanel>
    </div>
  );
};

export default EnvironmentsEnvironmentNameChartReleasesRoute;
