import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import type { SherlockGithubActionsDeployHookV3 } from "@sherlock-js-client/sherlock";
import { useEffect, useState } from "react";
import { TextAreaField } from "~/components/interactivity/text-area-field";
import { TextField } from "~/components/interactivity/text-field";
import {
  csrfTokenInputName,
  useCsrfToken,
} from "~/components/logic/csrf-token";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import type { SetsSidebarProps } from "~/hooks/use-sidebar";
import { DeployHookColors } from "../deploy-hook-colors";

export const GithubActionsDeployHookEditableFields: React.FunctionComponent<
  {
    existing?: SerializeFrom<SherlockGithubActionsDeployHookV3>;
    provideFileUrl?: (url: string) => void;
    provideFileName?: (name: string) => void;
    githubInfo: {
      [key: string]: {
        [key: string]: string[];
      };
    };
  } & SetsSidebarProps
> = ({
  existing,
  provideFileUrl,
  provideFileName,
  githubInfo,
  setSidebar,
  setSidebarFilterText,
}) => {
  const [githubActionsOwner, setGithubActionsOwner] = useState(
    existing?.githubActionsOwner ?? "",
  );
  const [githubActionsRepo, setGithubActionsRepo] = useState(
    existing?.githubActionsRepo ?? "",
  );
  const [githubActionsWorkflowPath, setGithubActionsWorkflowPath] = useState(
    existing?.githubActionsWorkflowPath ?? "",
  );
  const [githubActionsDefaultRef, setGithubActionsDefaultRef] = useState<
    string | null
  >(existing?.githubActionsDefaultRef ?? null);
  const [detectedDefaultRef, setDetectedDefaultRef] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const present =
      githubActionsOwner &&
      githubActionsRepo &&
      githubActionsWorkflowPath &&
      githubActionsDefaultRef !== "" &&
      (githubActionsDefaultRef || detectedDefaultRef);
    if (provideFileUrl) {
      provideFileUrl(
        present
          ? `https://github.com/${githubActionsOwner}/${githubActionsRepo}/blob/${
              githubActionsDefaultRef || detectedDefaultRef || "HEAD"
            }/${githubActionsWorkflowPath}`
          : "",
      );
    }
    if (provideFileName) {
      provideFileName(
        present
          ? `${githubActionsOwner}/${githubActionsRepo}/${githubActionsWorkflowPath}${
              githubActionsDefaultRef || detectedDefaultRef
                ? `@${githubActionsDefaultRef || detectedDefaultRef}`
                : ""
            }`
          : "",
      );
    }
  }, [
    detectedDefaultRef,
    githubActionsDefaultRef,
    githubActionsOwner,
    githubActionsRepo,
    githubActionsWorkflowPath,
    provideFileName,
    provideFileUrl,
  ]);

  const csrfToken = useCsrfToken();
  const defaultBranchFetcher = useFetcher();

  function getDefaultBranch(owner?: string, repo?: string) {
    owner = owner || githubActionsOwner;
    repo = repo || githubActionsRepo;
    if (owner && repo) {
      defaultBranchFetcher.submit(
        { [csrfTokenInputName]: csrfToken },
        {
          method: "post",
          action: `/api/github/get-default-branch/${owner}/${repo}`,
        },
      );
    }
  }

  useEffect(() => {
    if (
      defaultBranchFetcher.state === "idle" &&
      typeof defaultBranchFetcher.data === "string"
    ) {
      setDetectedDefaultRef(defaultBranchFetcher.data);
    }
  }, [defaultBranchFetcher]);

  function showOrgPanel() {
    setSidebar(({ filterText }) => (
      <SidebarFilterControlledList
        handleListButtonClick={(entry) => {
          setGithubActionsOwner(entry);
          document
            .querySelector<HTMLInputElement>("input[name=githubActionsRepo]")
            ?.focus();
          showRepoPanel(entry);
          getDefaultBranch(entry);
        }}
        detectListButtonActive={(entry) => filterText === entry}
        listButtonTextFactory={(entry) => entry}
        title="Select GitHub Organization"
        filter={(entry, filterText) => entry.includes(filterText)}
        filterText={filterText}
        entries={Object.keys(githubInfo)}
        {...DeployHookColors}
      />
    ));
  }

  function showRepoPanel(org: string) {
    setSidebar(({ filterText }) => (
      <SidebarFilterControlledList
        handleListButtonClick={(entry) => {
          setGithubActionsRepo(entry);
          document
            .querySelector<HTMLInputElement>(
              "input[name=githubActionsWorkflowPath]",
            )
            ?.focus();
          showWorkflowPanel(org, entry);
          getDefaultBranch(org, entry);
        }}
        detectListButtonActive={(entry) => filterText === entry}
        listButtonTextFactory={(entry) => entry}
        title="Select GitHub Repo"
        filter={(entry, filterText) => entry.includes(filterText)}
        filterText={filterText}
        entries={Object.keys(githubInfo[org] ?? {})}
        {...DeployHookColors}
      />
    ));
  }

  function showWorkflowPanel(org: string, repo: string) {
    setSidebar(({ filterText }) => (
      <SidebarFilterControlledList
        handleListButtonClick={(entry) => {
          setGithubActionsWorkflowPath(entry);
          setSidebar();
        }}
        detectListButtonActive={(entry) => filterText === entry}
        listButtonTextFactory={(entry) => entry}
        title="Select Workflow File"
        filter={(entry, filterText) => entry.includes(filterText)}
        filterText={filterText}
        entries={githubInfo[org] ? githubInfo[org][repo] ?? [] : []}
        {...DeployHookColors}
      />
    ));
  }

  return (
    <>
      <label>
        <h2 className="font-light text-2xl">GitHub Organization</h2>
        <p>
          The owner of the repository where the workflow you want to trigger is
          located.
        </p>
        <TextField
          name="githubActionsOwner"
          required
          placeholder="DataBiosphere"
          value={githubActionsOwner}
          onChange={(e) => {
            setGithubActionsOwner(e.currentTarget.value);
            setSidebarFilterText(e.currentTarget.value);
          }}
          onFocus={showOrgPanel}
          onBlur={() => getDefaultBranch()}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">GitHub Repository</h2>
        <p>The repository where the workflow you want to trigger is located.</p>
        <TextField
          name="githubActionsRepo"
          required
          placeholder="some-repository"
          value={githubActionsRepo}
          onChange={(e) => {
            setGithubActionsRepo(e.currentTarget.value);
            setSidebarFilterText(e.currentTarget.value);
          }}
          onFocus={() => showRepoPanel(githubActionsOwner)}
          onBlur={() => getDefaultBranch()}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">Workflow</h2>
        <p>The file path within the repository to the workflow to run.</p>
        <TextField
          name="githubActionsWorkflowPath"
          required
          placeholder=".github/workflows/some-workflow.yaml"
          value={githubActionsWorkflowPath}
          onChange={(e) => {
            setGithubActionsWorkflowPath(e.currentTarget.value);
            setSidebarFilterText(e.currentTarget.value);
          }}
          onFocus={() =>
            showWorkflowPanel(githubActionsOwner, githubActionsRepo)
          }
        />
      </label>
      <label>
        <h2 className="font-light text-2xl">Git Ref</h2>
        <p className="mb-2">
          The Git branch to use when accessing the workflow file in the
          repository.
        </p>
        <p>
          You can't use "HEAD" like you can on ArgoCD, this needs to be an
          actual branch.
        </p>
        <TextField
          name="githubActionsDefaultRef"
          required
          pattern="^((?!HEAD).)*$"
          placeholder={
            defaultBranchFetcher.state !== "idle"
              ? "Loading..."
              : detectedDefaultRef
              ? detectedDefaultRef
              : "branch-name"
          }
          value={
            githubActionsDefaultRef == null
              ? detectedDefaultRef || ""
              : githubActionsDefaultRef
          }
          onChange={(e) => setGithubActionsDefaultRef(e.currentTarget.value)}
        />
      </label>
      <label>
        <h2 className="font-light text-2xl mb-1">Inputs</h2>
        <details>
          <summary className="font-semibold mb-2 cursor-pointer">
            Show Configuration (Advanced)
          </summary>
          <p className="mb-2">
            This field is passed as-is through the{" "}
            <a
              href="https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28#create-a-workflow-dispatch-event"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-color-link-underline"
            >
              workflow dispatch API
            </a>{" "}
            as the inputs to the workflow. It needs to be either empty or a
            valid JSON object.
          </p>
          <p>
            GitHub will merge these values over top of any defaults the workflow
            provides to form the{" "}
            <a
              href="https://docs.github.com/en/actions/learn-github-actions/contexts#example-contents-of-the-inputs-context"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-color-link-underline"
            >
              inputs context
            </a>{" "}
            that's available inside the workflow. Beehive doesn't make much of
            an attempt to validate this field, so beware.
          </p>
          <TextAreaField
            name="githubActionsWorkflowInputs"
            className="font-mono"
            placeholder={`{"some-string-input": "value", "some-boolean-input": true}`}
            defaultValue={
              existing?.githubActionsWorkflowInputs
                ? JSON.stringify(
                    existing?.githubActionsWorkflowInputs,
                    undefined,
                    4,
                  )
                : undefined
            }
          />
        </details>
      </label>
    </>
  );
};
