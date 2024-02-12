import type { SerializeFrom } from "@remix-run/node";
import type { SherlockUserV3 } from "@sherlock-js-client/sherlock";
import { SelfUserContext } from "~/contexts";

export const UserLink: React.FunctionComponent<{
  user: SerializeFrom<SherlockUserV3> | SherlockUserV3;
}> = ({ user }) => (
  <SelfUserContext.Consumer>
    {(selfUser) => (
      <a
        href={`/users/${user.email}`}
        className="underline hover:decoration-color-link-underline decoration-color-link-underline/0 transition-colors"
        target="_blank"
        rel="noreferrer"
      >
        {user.name ? user.name : user.email?.split("@")[0]}
        {selfUser && user.email === selfUser.email && " (You)"}
        {user.email?.endsWith("gserviceaccount.com") && " (SA)"}
      </a>
    )}
  </SelfUserContext.Consumer>
);
