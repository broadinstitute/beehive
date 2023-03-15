import { LoaderArgs, SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { UsersApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { UserColors } from "~/features/sherlock/users/user-colors";
import { UserDetails } from "~/features/sherlock/users/view/user-details";
import { useUsersContext } from "./_layout.users";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/users/${params.userEmail}`}>{params.userEmail}</NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.userEmail} - User` },
];

export async function loader({ request, params }: LoaderArgs) {
  return new UsersApi(SherlockConfiguration)
    .apiV2UsersSelectorGet(
      { selector: params.userEmail || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const user = useLoaderData<typeof loader>();
  const { selfEmail } = useUsersContext();
  const isServiceAccount = user.email?.endsWith("gserviceaccount.com");
  return (
    <>
      <OutsetPanel {...UserColors}>
        <ItemDetails
          subtitle={isServiceAccount ? "Service Account" : "User Account"}
          title={user.name || user.email?.split("@")[0] || ""}
        >
          <UserDetails
            user={user}
            isServiceAccount={isServiceAccount}
            toEdit={user.email === selfEmail ? "./edit" : undefined}
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ user: user }} />
    </>
  );
}

export const useUserContext = useOutletContext<{
  user: SerializeFrom<ReturnType<typeof loader>>;
}>;