import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockGithubActionsDeployHookV3,
  SherlockSlackDeployHookV3,
} from "@sherlock-js-client/sherlock";

export function isGithubActionsDeployHook(
  deployHook:
    | SerializeFrom<SherlockGithubActionsDeployHookV3>
    | SerializeFrom<SherlockSlackDeployHookV3>,
): deployHook is SerializeFrom<SherlockGithubActionsDeployHookV3> {
  return deployHook.hasOwnProperty("githubActionsOwner");
}

export function isSlackDeployHook(
  deployHook:
    | SerializeFrom<SherlockGithubActionsDeployHookV3>
    | SerializeFrom<SherlockSlackDeployHookV3>,
): deployHook is SerializeFrom<SherlockSlackDeployHookV3> {
  return deployHook.hasOwnProperty("slackChannel");
}
