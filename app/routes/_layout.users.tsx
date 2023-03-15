import { LoaderArgs, SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { UsersApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { ListUserButtonText } from "~/features/sherlock/users/list/list-user-button-text";
import { matchUser } from "~/features/sherlock/users/list/matchUser";
import { makeUserSorter } from "~/features/sherlock/users/list/user-sorter";
import { UserColors } from "~/features/sherlock/users/user-colors";
import { UserGeneralDetails } from "~/features/sherlock/users/view/user-general-details";

export const handle = {
  breadcrumb: () => <NavLink to="/users">Users</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Users",
  },
];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const api = new UsersApi(SherlockConfiguration);
  const [selfUser, allUsers] = await Promise.all([
    api
      .apiV2ProceduresUsersMeGet(forwardIAP(request))
      .catch(errorResponseThrower),
    api.apiV2UsersGet({}, forwardIAP(request)).catch(errorResponseThrower),
  ]);
  return {
    selfEmail: selfUser.email,
    users: allUsers.sort(makeUserSorter(selfUser.email)),
    search,
  };
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { selfEmail, users, search } = useLoaderData<typeof loader>();
  const [filterText, setFilterText] = useState(search || "");
  return (
    <>
      <OutsetPanel>
        <UserGeneralDetails />
      </OutsetPanel>
      <InsetPanel>
        <InteractiveList title="Users" {...UserColors}>
          <div className="text-center text">
            You can search by email, GitHub username, Google or GitHub ID, etc.
          </div>
          <ListControls
            filterText={filterText}
            setFilterText={setFilterText}
            {...UserColors}
          />
          <MemoryFilteredList
            entries={users}
            filterText={filterText}
            filter={matchUser}
          >
            {(user, index) => (
              <NavButton to={`./${user.email}`} key={index} {...UserColors}>
                <ListUserButtonText user={user} selfEmail={selfEmail} />
              </NavButton>
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
      <Outlet context={{ selfEmail, users }} />
    </>
  );
}

export const useUsersContext = useOutletContext<
  SerializeFrom<ReturnType<typeof loader>>
>;
