import type { SerializeFrom } from "@remix-run/node";
import type { SherlockUserV3 } from "@sherlock-js-client/sherlock";

export function matchUser(
  user: SerializeFrom<SherlockUserV3>,
  matchText: string,
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
