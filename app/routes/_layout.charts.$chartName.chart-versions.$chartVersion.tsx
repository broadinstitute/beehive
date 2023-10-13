import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { defer } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import {
  ChartVersionsApi,
  CiIdentifiersApi,
} from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartVersionColors } from "~/features/sherlock/chart-versions/chart-version-colors";
import { ChartVersionDetails } from "~/features/sherlock/chart-versions/view/chart-version-details";
import {
  SherlockConfiguration,
  handleIAP,
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

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartName}/${params.chartVersion} - Chart Version`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return defer({
    ciRuns: new CiIdentifiersApi(SherlockConfiguration)
      .apiCiIdentifiersV3SelectorGet(
        {
          selector: `chart-version/${params.chartName}/${params.chartVersion}`,
        },
        handleIAP(request),
      )
      .then(
        (ciIdentifier) => ciIdentifier.ciRuns,
        () => undefined,
      ),
    chartVersion: await new ChartVersionsApi(SherlockConfiguration)
      .apiV2ChartVersionsSelectorGet(
        { selector: `${params.chartName}/${params.chartVersion}` },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartVersion, ciRuns } = useLoaderData<typeof loader>();
  const context = useChartContext();
  return (
    <>
      <OutsetPanel {...ChartVersionColors}>
        <ItemDetails
          subtitle={`Chart Version of ${chartVersion.chart}`}
          title={chartVersion.chartVersion || ""}
        >
          <ChartVersionDetails
            chartVersion={chartVersion}
            initialCiRuns={ciRuns}
            toEdit="./edit"
            toTimeline="./timeline"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ chartVersion, ...context }} />
    </>
  );
}

export const useChartChartVersionContext = useOutletContext<
  {
    chartVersion: SerializeFrom<typeof loader>["chartVersion"];
  } & ReturnType<typeof useChartContext>
>;
