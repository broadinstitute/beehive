import {
  json,
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
import { UsersApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { UserColors } from "~/features/sherlock/users/user-colors";
import { UserDetails } from "~/features/sherlock/users/view/user-details";
import { useUsersContext } from "./_layout.users";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/users/${params.userEmail}`}>{params.userEmail}</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.userEmail} - User` },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return json({
    slackWorkspaceID: process.env.SLACK_WORKSPACE_ID,
    user: await new UsersApi(SherlockConfiguration)
      .apiUsersV3SelectorGet(
        { selector: params.userEmail || "" },
        handleIAP(request),
      )
      .catch(errorResponseThrower),
  });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { slackWorkspaceID, user } = useLoaderData<typeof loader>();
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
            slackWorkspaceID={slackWorkspaceID}
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ user: user }} />
    </>
  );
}

export const useUserContext = useOutletContext<{
  user: SerializeFrom<typeof loader>["user"];
}>;
