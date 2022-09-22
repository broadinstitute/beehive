import { LoaderFunction } from "@remix-run/node";
import { useParams, NavLink, useLoaderData, Outlet } from "@remix-run/react";
import {
  AppVersionsApi,
  V2controllersAppVersion,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { AppVersionColors } from "~/content/app-version";
import { catchBoundary, errorBoundary } from "~/helpers/boundaries";
import {
  SherlockConfiguration,
  forwardIAP,
  errorResponseThrower,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/charts/${params.chartName}/app-versions`}>
        App Versions
      </NavLink>
    );
  },
};

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
                  {`${params.chartName} App @ `}
                  {<span className="font-medium">{appVersion.appVersion}</span>}
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

export default AppVersionsRoute;
