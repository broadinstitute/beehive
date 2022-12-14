import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
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
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import { liveEnvironmentSorter } from "~/components/content/environment/environment-sort.server";

export const handle = {
  breadcrumb: () => <NavLink to="/environments">Environments</NavLink>,
};

export const meta: MetaFunction = () => ({
  title: "Environments",
});

export const loader: LoaderFunction = async ({ request }) => {
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsGet({}, forwardIAP(request))
    .then(
      (environments) => [
        ...environments
          .filter((environment) => environment.base === "live")
          .sort(liveEnvironmentSorter),
        ...environments.filter((environment) => environment.base !== "live"),
      ],
      errorResponseThrower
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EnvironmentsRoute: React.FunctionComponent = () => {
  const environments = useLoaderData<Array<V2controllersEnvironment>>();
  const [filterText, setFilterText] = useState("");
  return (
    <Branch>
      <InsetPanel>
        <InteractiveList title="Environments" {...EnvironmentColors}>
          <ListControls
            setFilterText={setFilterText}
            toCreate="./new"
            {...EnvironmentColors}
          />
          <MemoryFilteredList
            entries={environments}
            filterText={filterText}
            filter={(environment, filterText) =>
              environment.lifecycle?.includes(filterText) ||
              environment.base?.includes(filterText) ||
              environment.name?.includes(filterText)
            }
          >
            {(environment, index) => (
              <NavButton
                to={`./${environment.name}/chart-releases`}
                key={index.toString()}
                {...EnvironmentColors}
              >
                <h2 className="font-light">
                  {environment.lifecycle !== "dynamic"
                    ? `${environment.lifecycle}: `
                    : ""}
                  {environment.base} /{" "}
                  <span className="font-medium">{environment.name}</span>
                </h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ environments }} />
    </Branch>
  );
};

export default EnvironmentsRoute;
