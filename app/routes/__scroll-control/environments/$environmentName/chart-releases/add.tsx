import { LoaderFunction } from "@remix-run/node";
import {
  useParams,
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import {
  ChartsApi,
  ClustersApi,
  V2controllersChart,
  V2controllersChartRelease,
  V2controllersCluster,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartColors } from "~/components/content/chart/chart-colors";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import {
  SherlockConfiguration,
  forwardIAP,
  errorResponseThrower,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink
        to={`/environments/${params.environmentName}/chart-releases/add`}
      >
        Add
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request }) => {
  return Promise.all([
    new ChartsApi(SherlockConfiguration)
      .apiV2ChartsGet({}, forwardIAP(request))
      .catch(errorResponseThrower),
    // We don't actually need the clusters here, but loading them here and passing
    // them down through via context means we won't be loading them repeatedly on
    // the next page if the user is browsing charts to deploy by clicking on them.
    new ClustersApi(SherlockConfiguration)
      .apiV2ClustersGet({}, forwardIAP(request))
      .catch(errorResponseThrower),
  ]);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const NewRoute: React.FunctionComponent = () => {
  const [charts, clusters] =
    useLoaderData<[Array<V2controllersChart>, Array<V2controllersCluster>]>();
  const { chartReleases, environment } = useOutletContext<{
    chartReleases: Array<V2controllersChartRelease>;
    environment: V2controllersEnvironment;
  }>();

  const chartsInEnvironment = new Set<string>(
    chartReleases
      .map((chartRelease) => chartRelease.chart)
      .filter((value): value is string => typeof value === "string")
  );

  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
      <InsetPanel>
        <InteractiveList title="Select Chart to Add" {...ChartColors}>
          <ListControls setFilterText={setFilterText} {...ChartColors} />
          <MemoryFilteredList
            entries={charts}
            filterText={filterText}
            filter={(chart, filterText) =>
              chart.name?.includes(filterText) ||
              chart.chartRepo?.includes(filterText)
            }
          >
            {(chart, index) => {
              const disabled =
                chart.name === undefined || chartsInEnvironment.has(chart.name);
              return (
                <NavButton
                  disabled={disabled}
                  to={`./${chart.name}`}
                  key={index.toString()}
                  {...ChartColors}
                >
                  <h2 className="font-light">
                    {`${chart.chartRepo} / `}
                    {<span className="font-medium">{chart.name}</span>}
                  </h2>
                </NavButton>
              );
            }}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ environment, clusters }} />
    </Branch>
  );
};

export default NewRoute;
