import { SerializeFrom } from "@remix-run/node";
import { V2controllersUser } from "@sherlock-js-client/sherlock";

export const ListUserButtonText: React.FunctionComponent<{
  user: SerializeFrom<V2controllersUser>;
  selfEmail?: string;
}> = ({ user, selfEmail }) => (
  <h2 className="font-light">
    {user.name ? (
      <>
        <b className="font-medium">{user.name}</b> ({user.email})
      </>
    ) : (
      <>
        <b className="font-medium">{user.email?.split("@")[0]}</b>@
        {user.email?.split("@")[1]}
      </>
    )}
    {selfEmail && user.email === selfEmail && (
      <>
        {" "}
        <b className="font-medium">(You)</b>
      </>
    )}
  </h2>
);
