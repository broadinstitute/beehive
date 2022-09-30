import { LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
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
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { ChartColors } from "~/components/content/chart/chart-colors";

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

const ChartsRoute: React.FunctionComponent = () => {
  const charts = useLoaderData<Array<V2controllersChart>>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
      <InsetPanel>
        <InteractiveList title="Charts" {...ChartColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate="./new"
            {...ChartColors}
          />
          <MemoryFilteredList
            entries={charts}
            filterText={filterText}
            filter={(chart, filterText) =>
              chart.name?.includes(filterText) ||
              chart.chartRepo?.includes(filterText)
            }
          >
            {(chart, index) => (
              <NavButton
                to={`./${chart.name}`}
                key={index.toString()}
                {...ChartColors}
              >
                <h2 className="font-light">
                  {`${chart.chartRepo} / `}
                  {<span className="font-medium">{chart.name}</span>}
                </h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </Branch>
  );
};

export default ChartsRoute;
