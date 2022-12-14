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
  AppVersionsApi,
  V2controllersAppVersion,
  V2controllersChart,
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
import { AppVersionColors } from "~/components/content/app-version/app-version-colors";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}/app-versions`}>
      App Versions
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.chartName} - App Versions`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  return new AppVersionsApi(SherlockConfiguration)
    .apiV2AppVersionsGet({ chart: params.chartName || "" }, forwardIAP(request))
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const AppVersionsRoute: React.FunctionComponent = () => {
  const params = useParams();
  const appVersions = useLoaderData<Array<V2controllersAppVersion>>();
  const { chart } = useOutletContext<{ chart: V2controllersChart }>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
      <InsetPanel>
        <InteractiveList
          title={`App Versions for ${params.chartName}`}
          {...AppVersionColors}
        >
          <ListControls setFilterText={setFilterText} {...AppVersionColors} />
          <MemoryFilteredList
            entries={appVersions}
            filterText={filterText}
            filter={(appVersion, filterText) =>
              appVersion.appVersion?.includes(filterText) ||
              appVersion.gitCommit?.includes(filterText) ||
              appVersion.gitBranch?.includes(filterText)
            }
          >
            {(appVersion, index) => (
              <NavButton
                to={`./${appVersion.appVersion}`}
                key={index.toString()}
                {...AppVersionColors}
              >
                <h2 className="font-light">
                  {`${params.chartName} app @ `}
                  {<span className="font-medium">{appVersion.appVersion}</span>}
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

export default AppVersionsRoute;
