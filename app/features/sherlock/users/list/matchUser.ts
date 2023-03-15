import { SerializeFrom } from "@remix-run/node";
import { V2controllersUser } from "@sherlock-js-client/sherlock";

export function matchUser(
  user: SerializeFrom<V2controllersUser>,
  matchText: string
): boolean {
  return (
    user.email?.includes(matchText) ||
    user.googleID?.includes(matchText) ||
    user.githubUsername?.includes(matchText) ||
    user.githubID?.includes(matchText) ||
    user.name?.includes(matchText) ||
    false
  );
}
