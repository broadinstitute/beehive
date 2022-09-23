import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import LineNavButton from "~/components/common/line-nav-button";
import {
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
} from "~/helpers/sherlock.server";
import ViewPanel from "~/components/OLD panels/view";
import { Leaf } from "~/components/components/route-tree/leaf";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/charts/${params.chartName}`}>{params.chartName}</NavLink>
    );
  },
};

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

const ChartsChartNameRoute: FunctionComponent = () => {
  const chart: V2controllersChart = useLoaderData();
  return (
    <div className="flex flex-row h-full grow">
      <ViewPanel
        title={chart.name}
        subtitle={`Helm Chart from ${chart.chartRepo}`}
        borderClassName="border-sky-300"
      >
        <LineNavButton
          to={`/charts/${chart.name}/chart-versions`}
          borderClassName="border-violet-300"
        >
          <h2 className="font-medium">View Chart Versions</h2>
        </LineNavButton>
        {chart.appImageGitRepo && (
          <div className="mt-8">
            <p>This Helm Chart deploys a specific application:</p>
            <a href={`https://github.com/${chart.appImageGitRepo}`}>
              <h2 className="text-2xl font-medium decoration-blue-500 underline">
                {chart.appImageGitRepo}
              </h2>
            </a>
            {chart.appImageGitMainBranch && (
              <p className="my-2">
                The app's stable branch is{" "}
                <a
                  href={`https://github.com/${chart.appImageGitRepo}/tree/${chart.appImageGitMainBranch}`}
                  className="font-mono decoration-blue-500 underline"
                >
                  {chart.appImageGitMainBranch}
                </a>
                .
              </p>
            )}
            <LineNavButton
              to={`/charts/${chart.name}/app-versions`}
              borderClassName="border-rose-300"
            >
              <h2 className="font-medium">View App Versions</h2>
            </LineNavButton>
          </div>
        )}
        <h2 className="text-2xl font-light">Change {chart.name}:</h2>
        <LineNavButton
          to={`/charts/${chart.name}/edit`}
          borderClassName="border-sky-300"
        >
          <h2 className="font-medium">Edit</h2>
        </LineNavButton>
        <LineNavButton
          to={`/charts/${chart.name}/delete`}
          borderClassName="border-sky-300"
        >
          <h2 className="font-medium">Delete</h2>
        </LineNavButton>
      </ViewPanel>
      <Outlet context={{ chart }} />
    </div>
  );
};

export default ChartsChartNameRoute;
