import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockGithubActionsDeployHookV3,
  SherlockSlackDeployHookV3,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ListControls } from "~/components/interactivity/list-controls";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { githubWorkflowNameFromPath } from "~/features/github/workflow-name-from-path";
import { DeployHookColors } from "../deploy-hook-colors";
import { isSlackDeployHook } from "../deploy-hook-typeguards";

export const DeployHooksListPanel: React.FunctionComponent<{
  resourceName?: string;
  hooks: SerializeFrom<
    SherlockGithubActionsDeployHookV3 | SherlockSlackDeployHookV3
  >[];
}> = ({ resourceName, hooks }) => {
  const [filterText, setFilterText] = useState("");
  return (
    <InsetPanel>
      <InteractiveList
        title={`Deploy Hooks${resourceName ? ` for ${resourceName}` : ""}`}
        {...DeployHookColors}
      >
        <ListControls
          setFilterText={setFilterText}
          toCreate="./new"
          toCreateText="Add New"
          {...DeployHookColors}
        />
        <MemoryFilteredList
          entries={hooks}
          filterText={filterText}
          filter={(
            entry:
              | SerializeFrom<SherlockGithubActionsDeployHookV3>
              | SerializeFrom<SherlockSlackDeployHookV3>,
            filterText: string,
          ) =>
            isSlackDeployHook(entry)
              ? "slack".includes(filterText) ||
                entry.slackChannel?.includes(filterText)
              : "github".includes(filterText) ||
                entry.githubActionsOwner?.includes(filterText) ||
                entry.githubActionsRepo?.includes(filterText) ||
                entry.githubActionsWorkflowPath?.includes(filterText)
          }
        >
          {(deployHook, index) => {
            return (
              <NavButton
                to={`./${
                  isSlackDeployHook(deployHook) ? "slack" : "github-actions"
                }/${deployHook.id}`}
                key={index.toString()}
                {...DeployHookColors}
              >
                {isSlackDeployHook(deployHook) ? (
                  <h2 className="font-light">
                    Slack:{" "}
                    <b className="font-medium">{deployHook.slackChannel}</b>
                  </h2>
                ) : (
                  <h2 className="font-light">
                    GitHub Actions:{" "}
                    <b className="font-medium">
                      {deployHook.githubActionsRepo}'s{" "}
                      {githubWorkflowNameFromPath(
                        deployHook.githubActionsWorkflowPath,
                      )}
                    </b>
                  </h2>
                )}
              </NavButton>
            );
          }}
        </MemoryFilteredList>
      </InteractiveList>
    </InsetPanel>
  );
};
