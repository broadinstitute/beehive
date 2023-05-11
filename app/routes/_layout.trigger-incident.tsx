import { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { EnvironmentsApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { errorResponseThrower } from "../errors/helpers/error-response-handlers";
import { environmentSorter } from "../features/sherlock/environments/list/environment-sorter";
import { matchEnvironment } from "../features/sherlock/environments/list/match-environment";

export const handle = {
  breadcrumb: () => <NavLink to="/trigger-incident">Trigger Incident</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Trigger Incident",
  },
];

export async function loader({ request }: LoaderArgs) {
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsGet({}, handleIAP(request))
    .then(
      (environments) =>
        environments
          .filter((environment) => environment.pagerdutyIntegration)
          .sort(environmentSorter),
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
        <InteractiveList title="Trigger Incident" {...EnvironmentColors}>
          <ListControls setFilterText={setFilterText} {...EnvironmentColors} />
          <MemoryFilteredList
            entries={environments}
            filterText={filterText}
            filter={matchEnvironment}
          >
            {(environment, index) => (
              <NavButton
                to={`./${environment.name}`}
                key={index.toString()}
                {...EnvironmentColors}
              >
                <h2 className="font-medium">{environment.name}</h2>
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet />
    </>
  );
}
