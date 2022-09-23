import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
} from "~/helpers/sherlock.server";
import ListPanel from "~/components/OLD panels/list";

export const handle = {
  breadcrumb: () => <NavLink to="/charts">Charts</NavLink>,
};

export const loader: LoaderFunction = async ({ request }) => {
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsGet({}, forwardIAP(request))
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartsRoute: FunctionComponent = () => {
  const charts: Array<V2controllersChart> = useLoaderData();
  return (
    <div className="flex flex-row h-full overflow-x-auto scroll-smooth">
      <ListPanel
        title="Charts"
        entries={charts}
        to={(chart) => `/charts/${chart.name}`}
        filter={(chart, filter) =>
          chart.name?.includes(filter) || chart.chartRepo?.includes(filter)
        }
        borderClassName="border-sky-300"
        toCreateNew="/charts/new"
      >
        {(chart) => (
          <h2 className="font-light">
            {`${chart.chartRepo} / `}
            {<span className="font-medium">{chart.name}</span>}
          </h2>
        )}
      </ListPanel>
      <Outlet />
    </div>
  );
};

export default ChartsRoute;
