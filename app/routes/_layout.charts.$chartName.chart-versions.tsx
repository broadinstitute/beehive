import { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { ChartVersionsApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartVersionColors } from "~/features/sherlock/chart-versions/chart-version-colors";
import { ListChartVersionButtonText } from "~/features/sherlock/chart-versions/list/list-chart-version-button-text";
import { matchChartVersion } from "~/features/sherlock/chart-versions/list/match-chart-version";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { useChartContext } from "~/routes/_layout.charts.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}/chart-versions`}>
      Chart Versions
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartName} - Chart Versions`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new ChartVersionsApi(SherlockConfiguration)
    .apiV2ChartVersionsGet(
      { chart: params.chartName || "" },
      handleIAP(request)
    )
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const params = useParams();
  const chartVersions = useLoaderData<typeof loader>();
  const context = useChartContext();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList
          title={`Chart Versions for ${params.chartName}`}
          {...ChartVersionColors}
        >
          <ListControls setFilterText={setFilterText} {...ChartVersionColors} />
          <MemoryFilteredList
            entries={chartVersions}
            filterText={filterText}
            filter={matchChartVersion}
          >
            {(chartVersion, index) => (
              <NavButton
                to={`./${chartVersion.chartVersion}`}
                key={index.toString()}
                {...ChartVersionColors}
              >
                <ListChartVersionButtonText chartVersion={chartVersion} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={context} />
    </>
  );
}
