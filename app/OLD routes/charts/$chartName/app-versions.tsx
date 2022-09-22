import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import {
  AppVersionsApi,
  V2controllersAppVersion,
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
      <NavLink to={`/charts/${params.chartName}/app-versions`}>
        App Versions
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new AppVersionsApi(SherlockConfiguration)
    .apiV2AppVersionsGet({ chart: params.chartName || "" }, forwardIAP(request))
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartsChartNameAppVersionsRoute: FunctionComponent = () => {
  const params = useParams();
  const appVersions: Array<V2controllersAppVersion> = useLoaderData();
  return (
    <div className="flex flex-row h-full">
      <ListPanel
        title={`App Versions for ${params.chartName}`}
        entries={appVersions}
        to={(appVersion) =>
          `/charts/${params.chartName}/app-versions/${appVersion.id}`
        }
        filter={(appVersion, filter) =>
          appVersion.appVersion?.includes(filter) ||
          appVersion.gitCommit?.includes(filter) ||
          appVersion.gitBranch?.includes(filter)
        }
        borderClassName="border-rose-300"
      >
        {(appVersion) => (
          <h2 className="font-light">
            {`${params.chartName} App @ `}
            {<span className="font-medium">{appVersion.appVersion}</span>}
          </h2>
        )}
      </ListPanel>
      <Outlet />
    </div>
  );
};

export default ChartsChartNameAppVersionsRoute;
