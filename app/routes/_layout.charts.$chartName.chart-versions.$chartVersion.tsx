import { LoaderArgs, SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { ChartVersionsApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartVersionColors } from "~/features/sherlock/chart-versions/chart-version-colors";
import { ChartVersionDetails } from "~/features/sherlock/chart-versions/view/chart-version-details";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { useChartContext } from "~/routes/_layout.charts.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-versions/${params.chartVersion}`}
    >
      {params.chartVersion}
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartName}/${params.chartVersion} - Chart Version`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new ChartVersionsApi(SherlockConfiguration)
    .apiV2ChartVersionsSelectorGet(
      { selector: `${params.chartName}/${params.chartVersion}` },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const chartVersion = useLoaderData<typeof loader>();
  const context = useChartContext();
  return (
    <>
      <OutsetPanel {...ChartVersionColors}>
        <ItemDetails
          subtitle={`Chart Version of ${chartVersion.chart}`}
          title={chartVersion.chartVersion || ""}
        >
          <ChartVersionDetails chartVersion={chartVersion} toEdit="./edit" />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ chartVersion, ...context }} />
    </>
  );
}

export const useChartChartVersionContext = useOutletContext<
  {
    chartVersion: SerializeFrom<typeof loader>;
  } & ReturnType<typeof useChartContext>
>;