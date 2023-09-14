import {
  LoaderArgs,
  SerializeFrom,
  V2_MetaFunction,
  defer,
} from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { ChartsApi, CiIdentifiersApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { ChartDetails } from "~/features/sherlock/charts/view/chart-details";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}`}>{params.chartName}</NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.chartName} - Chart` },
];

export async function loader({ request, params }: LoaderArgs) {
  return defer({
    ciRuns: new CiIdentifiersApi(SherlockConfiguration)
      .apiCiIdentifiersV3SelectorGet(
        {
          selector: `chart/${params.chartName}`,
        },
        handleIAP(request),
      )
      .then(
        (ciIdentifier) => ciIdentifier.ciRuns,
        () => [],
      ),
    chart: await new ChartsApi(SherlockConfiguration)
      .apiV2ChartsSelectorGet(
        { selector: params.chartName || "" },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chart, ciRuns } = useLoaderData<typeof loader>();
  return (
    <>
      <OutsetPanel {...ChartColors}>
        <ItemDetails
          subtitle={`Helm Chart from ${chart.chartRepo}`}
          title={chart.name || ""}
        >
          <ChartDetails
            chart={chart}
            initialCiRuns={ciRuns}
            toChartVersions="./chart-versions"
            toAppVersions="./app-versions"
            toChartReleases="./chart-releases"
            toEdit="./edit"
            toDelete="./delete"
            toContractTest="./contract-testing"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ chart }} />
    </>
  );
}

export const useChartContext = useOutletContext<{
  chart: SerializeFrom<typeof loader>["chart"];
}>;
