import {
  ActionArgs,
  LoaderArgs,
  redirect,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { ChangesetsApi, ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { useMemo, useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { ListControls } from "~/components/interactivity/list-controls";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { BigActionBox } from "~/components/panel-structures/big-action-box";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { runGha } from "~/features/github/run-gha";
import { ChangesetEntry } from "~/features/sherlock/changesets/list/changeset-entry";
import { ChartReleaseColors } from "~/features/sherlock/chart-releases/chart-release-colors";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { safeRedirectPath } from "~/helpers/validate";
import { commitSession } from "~/session.server";
import { ProdFlag } from "../components/layout/prod-flag";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { getValidSession } from "../helpers/get-valid-session.server";

export const handle = {
  breadcrumb: () => (
    <span className="pointer-events-none">Review Version Changes</span>
  ),
};

export const meta: V2_MetaFunction = () => [
  {
    title: "Review Version Changes",
  },
];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const changesetIDs = url.searchParams.getAll("changeset");
  const changesetsApi = new ChangesetsApi(SherlockConfiguration);
  const chartReleasesApi = new ChartReleasesApi(SherlockConfiguration);
  return Promise.all(
    changesetIDs.map(async (id) => {
      const changeset = await changesetsApi
        .apiV2ChangesetsSelectorGet({ selector: id }, forwardIAP(request))
        .catch(errorResponseThrower);
      // We need two levels deep, not one like Sherlock gives us by default,
      // so we fill the chartReleaseInfo ourselves with a followup request.
      changeset.chartReleaseInfo = await chartReleasesApi
        .apiV2ChartReleasesSelectorGet(
          {
            selector: changeset.chartRelease || "",
          },
          forwardIAP(request)
        )
        .catch(errorResponseThrower);
      return changeset;
    })
  );
}

export async function action({ request }: ActionArgs) {
  const session = await getValidSession(request);

  const formData = await request.formData();
  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsApplyPost(
      {
        applyRequest: formData
          .getAll("changeset")
          .filter((value): value is string => typeof value === "string"),
      },
      forwardIAP(request)
    )
    .then(async () => {
      if (
        formData.get("action") !== "none" &&
        formData
          .getAll("sync")
          .filter((value): value is string => typeof value === "string")
          .length > 0
      ) {
        runGha(
          session,
          {
            workflow_id: ".github/workflows/sync-release.yaml",
            inputs: {
              // Get this from hidden fields on the form so that we can filter out what is and isn't a template easily
              "chart-release-names": formData
                .getAll("sync")
                .filter((value): value is string => typeof value === "string")
                .join(","),
              "refresh-only": (formData.get("action") === "refresh").toString(),
            },
          },
          "sync your changes"
        );
      }
      return redirect(
        safeRedirectPath(formData.get("return")?.toString() || "/"),
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }, makeErrorResponseReturner());
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const changesets = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  let returnURL: string = "";
  ((value) => {
    if (value) {
      returnURL = decodeURIComponent(value);
    }
  })(searchParams.get("return"));
  if (!returnURL) {
    returnURL = "/";
  }
  const returnColors = returnURL.includes("chart-releases/")
    ? ChartReleaseColors
    : returnURL.includes("clusters")
    ? ClusterColors
    : EnvironmentColors;

  const [filterText, setFilterText] = useState("");
  const [actionToRun, setActionToRun] = useState("sync");

  const changesetLookup = useMemo(
    () =>
      new Map(
        changesets.map((changeset) => [changeset.chartRelease || "", changeset])
      ),
    [changesets]
  );
  const [includedChangesets, setIncludedChangesets] = useState<
    Map<string, boolean>
  >(
    new Map(
      changesets
        .filter(
          (changeset): changeset is { chartRelease: string } =>
            !changeset.appliedAt &&
            !changeset.supersededAt &&
            changeset.chartRelease !== undefined
        )
        .map((changeset) => [changeset.chartRelease, true])
    )
  );

  const includedCount = Array.from(includedChangesets).filter(
    ([_, included]) => included
  ).length;

  let includesProd = false;
  let includesTemplate = false;
  for (const changeset of changesets) {
    if (
      changeset.chartRelease &&
      includedChangesets.get(changeset.chartRelease)
    ) {
      if (
        changeset.chartReleaseInfo?.environment === "prod" ||
        changeset.chartReleaseInfo?.cluster === "terra-prod"
      ) {
        includesProd = true;
      }
      if (
        changeset.chartReleaseInfo?.environmentInfo?.lifecycle === "template"
      ) {
        includesTemplate = true;
      }
    }
  }

  const [showProdModal, setShowProdModal] = useState(includesProd);

  if (showProdModal) {
    return (
      <div
        data-theme-prod="true"
        className="absolute w-full h-full bg-color-far-bg flex flex-col items-center justify-center text-color-header-text"
      >
        <h2 className="text-6xl font-extralight">Hey, these changes affect</h2>
        <h1 className="text-[12rem] leading-none font-semibold">Production</h1>
        <h3 className="text-3xl font-extralight">
          The usual review screen is coming up next
        </h3>
        <br />
        <ActionButton
          type="button"
          beforeBorderClassName="before:border-color-neutral-hard-border"
          textAlignment="text-center"
          onClick={() => setShowProdModal(false)}
        >
          Click to Continue
        </ActionButton>
      </div>
    );
  }

  return (
    <ProdFlag prod={includesProd}>
      <OutsetPanel>
        <BigActionBox
          title="Review Version Changes"
          returnPath={returnURL}
          returnText="Go Back Without Applying"
          submitText={`Apply ${includedCount} Change${
            includedCount == 1 ? "" : "s"
          }`}
          hideButton={includedCount == 0}
          {...returnColors}
        >
          <p>
            Applying these changes will immediately update our systems to
            reflect what the versions of{" "}
            {changesets.length > 0
              ? "this chart instance"
              : `these ${changesets.length} chart instances`}{" "}
            should be.
          </p>
          {filterText && (
            <p>
              Note that this button will apply <i>all</i> the below changes, not
              just the ones visible with your "{filterText}" filter.
            </p>
          )}
          {changesets.length > 1 && (
            <div className="flex flex-col space-y-1">
              You can click the checkboxes to choose which changes to apply.
              <ul>
                {Array.from(includedChangesets).map(([name, included]) => (
                  <li key={name}>
                    <label className="inline-block cursor-pointer">
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={() => {
                          setIncludedChangesets(
                            (previous) =>
                              new Map([
                                ...previous,
                                [name, !(previous.get(name) || false)],
                              ])
                          );
                        }}
                        name="changeset"
                        value={changesetLookup.get(name)?.id}
                        className="align-middle mr-3"
                      />
                      <span className="align-middle">{name}</span>
                    </label>
                    {changesetLookup.get(name)?.chartReleaseInfo
                      ?.environmentInfo?.lifecycle === "template" || (
                      <input type="hidden" name="sync" value={name} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {changesets.length == 1 && (
            <>
              <input
                type="hidden"
                name="changeset"
                value={changesets.at(0)?.id}
              />
              {changesets.at(0)?.chartReleaseInfo?.environmentInfo
                ?.lifecycle === "template" || (
                <input
                  type="hidden"
                  name="sync"
                  value={changesets.at(0)?.chartRelease || ""}
                />
              )}
            </>
          )}
          <div>
            <h2 className="font-light text-2xl">Action to Run</h2>
            <EnumInputSelect
              name="action"
              className="grid grid-cols-3 mt-2"
              fieldValue={actionToRun}
              setFieldValue={setActionToRun}
              enums={[
                ["Refresh + Sync", "sync"],
                ["Refresh", "refresh"],
                ["None", "none"],
              ]}
              {...returnColors}
            />
            <div className="mt-4 pl-6 border-l-2 border-color-divider-line flex flex-col">
              {actionToRun === "sync" && (
                <>
                  <p className="pb-2">
                    When applying, a GitHub Action will be kicked off to{" "}
                    <b className="font-semibold">refresh and sync</b> ArgoCD.
                    This will deploy the applied versions immediately.
                  </p>
                  <p>
                    Note that refreshing ArgoCD just makes it notice the
                    versions you're applying here, it won't recalculate
                    anything.
                  </p>
                </>
              )}
              {actionToRun === "refresh" && (
                <>
                  <p className="pb-2">
                    When applying, a GitHub Action will be kicked off to{" "}
                    <b className="font-semibold">just refresh</b> ArgoCD. This
                    will not deployed the applied versions immediately, but it
                    will make ArgoCD say that the app is "out of sync." ArgoCD's
                    manual sync button would then deploy the new versions.
                  </p>
                  <p>
                    Note that refreshing ArgoCD just makes it notice the
                    versions you're applying here, it won't recalculate
                    anything.
                  </p>
                </>
              )}
              {actionToRun === "none" && (
                <p>
                  When applying, no GitHub Action will be kicked off. The
                  changes won't be deployed until someone or something
                  hard-refreshes and syncs ArgoCD.
                </p>
              )}
              {includesTemplate && (
                <p className="mt-4">
                  {
                    "At least one of the changes you're applying is to a template, so no GitHub Actions will be run for that regardless of what option you select here."
                  }
                </p>
              )}
            </div>
          </div>
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </BigActionBox>
      </OutsetPanel>

      <InsetPanel doubleWidth>
        <InteractiveList
          title="Changes to Be Applied"
          doubleWidth
          {...ChartReleaseColors}
        >
          <ListControls
            filterText={filterText}
            setFilterText={setFilterText}
            doubleWidth
            {...returnColors}
          />
          <MemoryFilteredList
            filterText={filterText}
            entries={changesets}
            filter={(changeset, filterText) =>
              changeset.chartReleaseInfo?.name?.includes(filterText) ||
              changeset.chartReleaseInfo?.chart?.includes(filterText) ||
              changeset.chartReleaseInfo?.environment?.includes(filterText) ||
              changeset.chartReleaseInfo?.cluster?.includes(filterText) ||
              changeset.chartReleaseInfo?.namespace?.includes(filterText) ||
              changeset.chartReleaseInfo?.appVersionExact?.includes(
                filterText
              ) ||
              changeset.toAppVersionResolver?.includes(filterText) ||
              changeset.chartReleaseInfo?.chartVersionExact?.includes(
                filterText
              ) ||
              changeset.toChartVersionResolver?.includes(filterText)
            }
          >
            {(changeset, index) => (
              <ChangesetEntry
                changeset={changeset}
                key={index}
                includedCheckboxValue={
                  changesets.length > 1
                    ? includedChangesets.get(
                        changeset.chartRelease as string
                      ) || false
                    : undefined
                }
                setIncludedCheckboxValue={(value: boolean) =>
                  setIncludedChangesets(
                    (previous) =>
                      new Map([
                        ...previous,
                        [changeset.chartRelease as string, value],
                      ])
                  )
                }
                startMinimized={changesets.length > 1}
              />
            )}
          </MemoryFilteredList>
        </InteractiveList>
      </InsetPanel>
    </ProdFlag>
  );
}
