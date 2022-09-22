import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData, useParams } from "@remix-run/react";
import {
  AppVersionsApi,
  V2controllersAppVersion,
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
  breadcrumb: (routeData: V2controllersAppVersion) => {
    const params = useParams();
    return (
      <NavLink
        to={`/charts/${params.chartName}/app-versions/${params.appVersionID}`}
      >
        {routeData.appVersion}
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new AppVersionsApi(SherlockConfiguration)
    .apiV2AppVersionsSelectorGet(
      { selector: params.appVersionID || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartsChartNameChartVersionsChartVersionIDRoute: FunctionComponent =
  () => {
    const appVersion: V2controllersAppVersion = useLoaderData();
    const ref = useRef(null);
    useEffect(() => {
      (ref.current as Element | null)?.scrollIntoView();
    }, [appVersion]);
    return (
      <div className="flex flex-row h-full" ref={ref}>
        <ViewPanel
          title={appVersion.appVersion}
          subtitle={`App Version of ${appVersion.chart}`}
          borderClassName="border-rose-300"
        >
          <p>Created at {appVersion.createdAt}</p>
          {appVersion.gitBranch && (
            <p>
              Git Branch{" "}
              <a
                href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}/tree/${appVersion.gitBranch}`}
                className="font-mono decoration-blue-500 underline"
              >
                {appVersion.gitBranch}
              </a>
            </p>
          )}
          {appVersion.gitCommit && (
            <p>
              Git Commit{" "}
              <a
                href={`https://github.com/${appVersion.chartInfo?.appImageGitRepo}/commit/${appVersion.gitCommit}`}
                className="font-mono decoration-blue-500 underline"
              >
                {appVersion.gitCommit}
              </a>
            </p>
          )}
        </ViewPanel>
      </div>
    );
  };

export default ChartsChartNameChartVersionsChartVersionIDRoute;
