import { LoaderFunction } from "@remix-run/node";
import { useParams, NavLink, useLoaderData, Outlet } from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { ChartReleaseColors } from "~/components/content/chart-release";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  SherlockConfiguration,
  forwardIAP,
  errorResponseThrower,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/environments/${params.environmentName}/chart-releases`}>
        Charts
      </NavLink>
    );
  },
};

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

const ChartReleasesRoute: React.FunctionComponent = () => {
  const params = useParams();
  const chartReleases = useLoaderData<Array<V2controllersChartRelease>>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
      <InsetPanel>
        <InteractiveList
          title={`Charts in ${params.environmentName}`}
          {...ChartReleaseColors}
        >
          <ListControls
            setFilterText={setFilterText}
            // toCreate="./new"
            {...ChartReleaseColors}
          />
          <MemoryFilteredList
            entries={chartReleases}
            filterText={filterText}
            filter={(chartRelease, filterText) =>
              chartRelease.name?.includes(filterText)
            }
          >
            {(chartRelease, index) => (
              <NavButton
                to={`./${chartRelease.name}`}
                key={index.toString()}
                {...ChartReleaseColors}
              >
                <h2>{chartRelease.chart}</h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </Branch>
  );
};

export default ChartReleasesRoute;
