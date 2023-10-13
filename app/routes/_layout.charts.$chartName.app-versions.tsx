import { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { AppVersionsApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { AppVersionColors } from "~/features/sherlock/app-versions/app-version-colors";
import { ListAppVersionButtonText } from "~/features/sherlock/app-versions/list/list-app-version-button-text";
import { matchAppVersion } from "~/features/sherlock/app-versions/list/match-app-version";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { useChartContext } from "~/routes/_layout.charts.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}/app-versions`}>
      App Versions
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartName} - App Versions`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new AppVersionsApi(SherlockConfiguration)
    .apiAppVersionsV3Get({ chart: params.chartName || "" }, handleIAP(request))
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const params = useParams();
  const appVersions = useLoaderData<typeof loader>();
  const context = useChartContext();
  const [filterText, setFilterText] = useState("");
  return (
    <>
      <InsetPanel>
        <InteractiveList
          title={`App Versions for ${params.chartName}`}
          {...AppVersionColors}
        >
          <ListControls setFilterText={setFilterText} {...AppVersionColors} />
          <MemoryFilteredList
            entries={appVersions}
            filterText={filterText}
            filter={matchAppVersion}
          >
            {(appVersion, index) => (
              <NavButton
                to={`./${appVersion.appVersion}`}
                key={index.toString()}
                {...AppVersionColors}
              >
                <ListAppVersionButtonText appVersion={appVersion} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={context} />
    </>
  );
}
