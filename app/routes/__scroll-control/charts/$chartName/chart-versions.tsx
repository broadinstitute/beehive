import { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  useParams,
  NavLink,
  useLoaderData,
  Outlet,
  Params,
  useOutletContext,
} from "@remix-run/react";
import {
  ChartVersionsApi,
  V2controllersChart,
  V2controllersChartVersion,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  SherlockConfiguration,
  forwardIAP,
  errorResponseThrower,
} from "~/helpers/sherlock.server";
import { ChartVersionColors } from "~/components/content/chart-version/chart-version-colors";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}/chart-versions`}>
      Chart Versions
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.chartName} - Chart Versions`,
});

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

const ChartVersionsRoute: React.FunctionComponent = () => {
  const params = useParams();
  const chartVersions = useLoaderData<Array<V2controllersChartVersion>>();
  const { chart } = useOutletContext<{ chart: V2controllersChart }>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
      <InsetPanel>
        <InteractiveList
          title={`Chart Versions for ${params.chartName}`}
          {...ChartVersionColors}
        >
          <ListControls setFilterText={setFilterText} {...ChartVersionColors} />
          <MemoryFilteredList
            entries={chartVersions}
            filterText={filterText}
            filter={(chartVersion, filterText) =>
              chartVersion.chartVersion?.includes(filterText)
            }
          >
            {(chartVersion, index) => (
              <NavButton
                to={`./${chartVersion.chartVersion}`}
                key={index.toString()}
                {...ChartVersionColors}
              >
                <h2 className="font-light">
                  {`${params.chartName} chart @ `}
                  {
                    <span className="font-medium">
                      {chartVersion.chartVersion}
                    </span>
                  }
                </h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ chart }} />
    </Branch>
  );
};

export default ChartVersionsRoute;
