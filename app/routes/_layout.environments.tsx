import { LoaderArgs, SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { EnvironmentsApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";
import { environmentSorter } from "../features/sherlock/environments/list/environment-sorter";
import { ListEnvironmentButtonText } from "../features/sherlock/environments/list/list-environment-button-text";
import { matchEnvironment } from "../features/sherlock/environments/list/match-environment";

export const handle = {
  breadcrumb: () => <NavLink to="/environments">Environments</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Environments",
  },
];

export async function loader({ request }: LoaderArgs) {
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsGet({}, forwardIAP(request))
    .then(
      (environments) => environments.sort(environmentSorter),
      errorResponseThrower
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const environments = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState("");
  return (
    <>
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
            filter={matchEnvironment}
          >
            {(environment, index) => (
              <NavButton
                to={`./${environment.name}/chart-releases`}
                key={index.toString()}
                {...EnvironmentColors}
              >
                <ListEnvironmentButtonText environment={environment} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ environments }} />
    </>
  );
}

export const useEnvironmentsContext = useOutletContext<{
  environments: SerializeFrom<typeof loader>;
}>;