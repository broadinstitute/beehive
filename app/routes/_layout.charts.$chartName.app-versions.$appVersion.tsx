import {
  defer,
  type LoaderFunctionArgs,
  type MetaFunction,
  type SerializeFrom,
} from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { AppVersionsApi, CiIdentifiersApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { AppVersionColors } from "~/features/sherlock/app-versions/app-version-colors";
import { AppVersionDetails } from "~/features/sherlock/app-versions/view/app-version-details";
import {
  handleIAP,
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

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartName}/${params.appVersion} - App Version`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return defer({
    ciRuns: new CiIdentifiersApi(SherlockConfiguration)
      .apiCiIdentifiersV3SelectorGet(
        {
          selector: `app-version/${params.chartName}/${params.appVersion}`,
        },
        handleIAP(request),
      )
      .then(
        (ciIdentifier) => ciIdentifier.ciRuns,
        () => undefined,
      ),
    appVersion: await new AppVersionsApi(SherlockConfiguration)
      .apiAppVersionsV3SelectorGet(
        { selector: `${params.chartName}/${params.appVersion}` },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { appVersion, ciRuns } = useLoaderData<typeof loader>();
  const context = useChartContext();
  return (
    <>
      <OutsetPanel {...AppVersionColors}>
        <ItemDetails
          subtitle={`App Version of ${appVersion.chart}`}
          title={appVersion.appVersion || ""}
        >
          <AppVersionDetails
            appVersion={appVersion}
            initialCiRuns={ciRuns}
            toEdit="./edit"
            toTimeline="./timeline"
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ appVersion, ...context }} />
    </>
  );
}

export const useChartAppVersionContext = useOutletContext<
  {
    appVersion: SerializeFrom<typeof loader>["appVersion"];
  } & ReturnType<typeof useChartContext>
>;
