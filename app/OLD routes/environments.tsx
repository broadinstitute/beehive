import { LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";
import ListPanel from "~/components/OLD panels/list";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => <NavLink to="/environments">Environments</NavLink>,
};

export const loader: LoaderFunction = async ({ request }) => {
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsGet({}, forwardIAP(request))
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EnvironmentsRoute: FunctionComponent = () => {
  const environments: Array<V2controllersEnvironment> = useLoaderData();
  return (
    <div className="flex flex-row h-full overflow-x-auto scroll-smooth">
      <ListPanel
        title="Environments"
        entries={environments}
        to={(environment) => `/environments/${environment.name}`}
        filter={(environment, filter) =>
          environment.name?.includes(filter) ||
          environment.lifecycle?.includes(filter) ||
          environment.base?.includes(filter)
        }
        borderClassName="border-amber-300"
        toCreateNew="/environments/new"
      >
        {(environment) => (
          <h2 className="font-light">
            {environment.lifecycle !== "dynamic"
              ? `${environment.lifecycle}: `
              : ""}
            {environment.base} /{" "}
            <span className="font-medium">{environment.name}</span>
          </h2>
        )}
      </ListPanel>
      <Outlet />
    </div>
  );
};

export default EnvironmentsRoute;
