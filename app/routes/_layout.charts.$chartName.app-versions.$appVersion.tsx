import { LoaderArgs, SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { AppVersionsApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { AppVersionColors } from "~/features/sherlock/app-versions/app-version-colors";
import { AppVersionDetails } from "~/features/sherlock/app-versions/view/app-version-details";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { useChartContext } from "~/routes/_layout.charts.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/app-versions/${params.appVersion}`}
    >
      {params.appVersion}
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartName}/${params.appVersion} - App Version`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new AppVersionsApi(SherlockConfiguration)
    .apiV2AppVersionsSelectorGet(
      { selector: `${params.chartName}/${params.appVersion}` },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const appVersion = useLoaderData<typeof loader>();
  const context = useChartContext();
  return (
    <>
      <OutsetPanel {...AppVersionColors}>
        <ItemDetails
          subtitle={`App Version of ${appVersion.chart}`}
          title={appVersion.appVersion || ""}
        >
          <AppVersionDetails appVersion={appVersion} toEdit="./edit" />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ appVersion, ...context }} />
    </>
  );
}

export const useChartAppVersionContext = useOutletContext<
  {
    appVersion: SerializeFrom<typeof loader>;
  } & ReturnType<typeof useChartContext>
>;
