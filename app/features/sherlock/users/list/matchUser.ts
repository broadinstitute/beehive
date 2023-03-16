import { SerializeFrom } from "@remix-run/node";
import { V2controllersUser } from "@sherlock-js-client/sherlock";

export function matchUser(
  user: SerializeFrom<V2controllersUser>,
  matchText: string
): boolean {
  matchText = matchText.toLowerCase();
  return (
    user.email?.toLowerCase()?.includes(matchText) ||
    user.googleID?.toLowerCase()?.includes(matchText) ||
    user.githubUsername?.toLowerCase()?.includes(matchText) ||
    user.githubID?.toLowerCase()?.includes(matchText) ||
    user.name?.toLowerCase()?.includes(matchText) ||
    false
  );
}
