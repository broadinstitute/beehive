import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import type { SherlockGithubActionsDeployHookV3 } from "@sherlock-js-client/sherlock";
import { useEffect, useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
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
    showRefBehaviorField?: boolean;
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
  showRefBehaviorField,
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
        <h2 className="font-light text-2xl text-color-header-text">
          GitHub Organization
        </h2>
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
        <h2 className="font-light text-2xl text-color-header-text">
          GitHub Repository
        </h2>
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
        <h2 className="font-light text-2xl text-color-header-text">Workflow</h2>
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
        <h2 className="font-light text-2xl text-color-header-text">
          {showRefBehaviorField ? "Default " : ""}Git Ref
        </h2>
        <p className="mb-2">
          The {showRefBehaviorField ? "default " : ""}Git branch to use when
          accessing the workflow file in the repository.
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
      {showRefBehaviorField && <RefBehaviorField existing={existing} />}
      <label>
        <h2 className="font-light text-2xl text-color-header-text mb-1">
          Inputs
        </h2>
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

const RefBehaviorField: React.FunctionComponent<{
  existing?: SerializeFrom<SherlockGithubActionsDeployHookV3>;
}> = ({ existing }) => {
  const [refBehavior, setRefBehavior] = useState<
    | "always-use-default-ref"
    | "use-app-version-as-ref"
    | "use-app-version-commit-as-ref"
  >(
    existing?.githubActionsRefBehavior === "always-use-default-ref" ||
      existing?.githubActionsRefBehavior === "use-app-version-as-ref" ||
      existing?.githubActionsRefBehavior === "use-app-version-commit-as-ref"
      ? existing?.githubActionsRefBehavior
      : "always-use-default-ref",
  );
  return (
    <>
      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Git Ref Behavior
        </h2>
        <EnumInputSelect<
          | "always-use-default-ref"
          | "use-app-version-as-ref"
          | "use-app-version-commit-as-ref"
        >
          name="githubActionsRefBehavior"
          className="grid grid-cols-3 mt-2"
          fieldValue={refBehavior}
          setFieldValue={setRefBehavior}
          enums={[
            ["Always Use Default Ref", "always-use-default-ref"],
            ["Look Up App Version's Ref", "use-app-version-commit-as-ref"],
            ["Always Use App Version As Ref", "use-app-version-as-ref"],
          ]}
          {...DeployHookColors}
        />
      </div>
      <div className="pl-6 border-l-2 border-color-divider-line flex gap-4 flex-col">
        {refBehavior === "always-use-default-ref" && (
          <p>
            Beehive will always run the workflow on the default ref configured
            above.
          </p>
        )}
        {refBehavior === "use-app-version-commit-as-ref" && (
          <>
            <p>
              Beehive will try to look up the ref the deployed app version was
              built on and run the workflow on that ref.
            </p>
            <p>
              This works if the service is deployed with the modern "
              <a
                href="https://docs.google.com/document/d/1lkUkN2KOpHKWufaqw_RIE7EN3vN4G2xMnYBU83gi8VA/edit#heading=h.5tlvfawo6e7u"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-color-link-underline"
              >
                deploy to dev
              </a>
              " mechanism (and the workflow is in the same repo as what makes
              the app versions).
            </p>
            <p>
              Beehive will fall back to the default ref if the lookup fails.
            </p>
            <p>
              You should prefer this option over "Always Use App Version As Ref"
              when possible.
            </p>
          </>
        )}
        {refBehavior === "use-app-version-as-ref" && (
          <>
            <p>
              Beehive will use the deployed app version itself as the ref to run
              the workflow on.
            </p>
            <p>
              This only works if each and every version created by the
              repository is tagged or a commit has in a way that GitHub's API
              will always understand (and the workflow is in the same repo as
              what makes the app versions).
            </p>
            <p>
              Beehive will not fall back to the default ref, because this option
              shifts the responsibility to GitHub.
            </p>
            <p>
              You should prefer the "Look Up App Version's Ref" option over this
              one when possible.
            </p>
          </>
        )}
      </div>
    </>
  );
};
