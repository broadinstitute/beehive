import type { useInteractions } from "@floating-ui/react";
import type { SerializeFrom } from "@remix-run/node";
import { Await, useFetcher } from "@remix-run/react";
import type { SherlockCiRunV3 } from "@sherlock-js-client/sherlock";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  CircleDashed,
  CircleDotDashed,
  CircleSlash,
  RedoDot,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Suspense, forwardRef, memo, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeehiveIcon } from "~/components/assets/beehive-icon";
import { ActionButton } from "~/components/interactivity/action-button";
import { Popover } from "~/components/interactivity/popover";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { isReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { githubWorkflowNameFromPath } from "~/features/github/workflow-name-from-path";
import type { ProxiedGetCiIdentifier } from "~/routes/api.sherlock.get-ci-identifier.$";
import { isProxiedCiIdentifier } from "~/routes/api.sherlock.get-ci-identifier.$";
import { CiColors } from "../ci-colors";

export const CiRunResourceStatusWidget = memo<{
  ciIdentifier?: string | number;
  initialCiRuns?:
    | Promise<SerializeFrom<SherlockCiRunV3[]>>
    | SerializeFrom<SherlockCiRunV3[]>;
  poll?: boolean;
  asChip?: boolean;
}>(
  ({ ciIdentifier, initialCiRuns, poll = true, asChip = false }) => {
    return !initialCiRuns || Array.isArray(initialCiRuns) ? (
      <CiRunResourceAwaitedWidget
        ciIdentifier={ciIdentifier}
        initialCiRuns={initialCiRuns}
        poll={poll}
        asChip={asChip}
      />
    ) : (
      <Suspense fallback={<CiRunResourceLoadingBox asChip={asChip} />}>
        <Await
          resolve={initialCiRuns}
          errorElement={<CiRunResourceNotFoundBox asChip={asChip} />}
        >
          {(initialCiRuns) => (
            <CiRunResourceAwaitedWidget
              ciIdentifier={ciIdentifier}
              initialCiRuns={initialCiRuns}
              poll={poll}
              asChip={asChip}
            />
          )}
        </Await>
      </Suspense>
    );
  },
  (previous, next): boolean => {
    return (
      previous.ciIdentifier === next.ciIdentifier && previous.poll === next.poll
    );
  },
);
CiRunResourceStatusWidget.displayName = "CiRunResourceStatusWidget";

const CiRunResourceLoadingBox: React.FunctionComponent<{
  asChip: boolean;
}> = ({ asChip }) =>
  asChip ? (
    <button
      type="button"
      disabled
      className={`cursor-wait shrink-0 border rounded-xl px-2 bg-color-near-bg ${CiColors.borderClassName} flex flex-row gap-2 h-8 items-center`}
    >
      <BeehiveIcon className="shrink-0 h-4 w-4" loading />
      <div className="text-xl font-light">Loading Workflow Runs...</div>
    </button>
  ) : (
    <div className="relative shrink-0">
      <button
        type="button"
        className={`cursor-wait flex flex-row items-center bg-color-nearest-bg rounded-2xl min-h-[3rem] w-full focus-visible:outline focus-visible:outline-color-focused-element before:w-full before:h-full before:block before:absolute before:rounded-2xl before:border-2 shadow-md ${CiColors.beforeBorderClassName} motion-safe:transition-all before:motion-safe:transition-all`}
        disabled
      >
        <div className="shrink-0 flex flex-row gap-2 justify-between items-center h-full w-full px-[1rem] py-2">
          <BeehiveIcon className="shrink-0 h-6 w-6" loading />
          <div className="grow text-xl font-light text-color-body-text text-left">
            Loading Workflow Runs...
          </div>
        </div>
      </button>
    </div>
  );

const CiRunResourceNotFoundBox: React.FunctionComponent<{
  asChip: boolean;
}> = ({ asChip }) =>
  asChip ? (
    <button
      type="button"
      disabled
      className={`cursor-not-allowed shrink-0 border rounded-xl px-2 bg-color-near-bg ${CiColors.borderClassName} flex flex-row gap-2 h-8 items-center`}
    >
      <CircleDashed className="shrink-0 stroke-color-status-gray" />
      <div className="text-xl font-light">No Workflow Runs Found</div>
    </button>
  ) : (
    <div className="relative shrink-0">
      <button
        type="button"
        className={`cursor-not-allowed flex flex-row items-center bg-color-nearest-bg rounded-2xl min-h-[3rem] w-full focus-visible:outline focus-visible:outline-color-focused-element before:w-full before:h-full before:block before:absolute before:rounded-2xl before:border-2 shadow-md ${CiColors.beforeBorderClassName} motion-safe:transition-all before:motion-safe:transition-all`}
        disabled
      >
        <div className="shrink-0 flex flex-row gap-2 justify-between items-center h-full w-full px-[1rem] py-2">
          <CircleDashed className="shrink-0 stroke-color-status-gray" />
          <div className="grow text-xl font-light text-color-body-text text-left">
            No Workflow Runs Found
          </div>
        </div>
      </button>
    </div>
  );

const CiRunResourceAwaitedWidget: React.FunctionComponent<{
  ciIdentifier?: string | number;
  initialCiRuns?: SerializeFrom<SherlockCiRunV3[]>;
  poll?: boolean;
  asChip: boolean;
}> = ({ ciIdentifier, initialCiRuns, poll, asChip }) => {
  const ciIdentifierFetcher = useFetcher<ProxiedGetCiIdentifier>();
  const [ciRuns, setCiRuns] = useState(initialCiRuns || []);
  const [initialLoad, setInitialLoad] = useState(!initialCiRuns);
  const [moreToLoad, setMoreToLoad] = useState(true);

  useEffect(() => {
    setCiRuns(initialCiRuns || []);
    setInitialLoad(!initialCiRuns);
  }, [ciIdentifier, initialCiRuns]);

  // When props or fetcher change, if we don't have any CiRuns, start a fetch to get some
  useEffect(() => {
    if (initialLoad && ciIdentifier && ciIdentifierFetcher.state === "idle") {
      ciIdentifierFetcher.load(
        `/api/sherlock/get-ci-identifier/${ciIdentifier}`,
      );
    }
  }, [initialLoad, ciIdentifier, ciIdentifierFetcher]);

  // When fetcher changes (whether due to initial load or polling), merge in its CiRuns
  useEffect(() => {
    if (ciIdentifierFetcher.state === "idle" && ciIdentifierFetcher.data) {
      setInitialLoad(false);
      if (isReturnedErrorInfo(ciIdentifierFetcher.data)) {
        console.log(ciIdentifierFetcher.data.errorSummary);
      } else if (
        isProxiedCiIdentifier(ciIdentifierFetcher.data) &&
        ciIdentifierFetcher.data.ciRuns
      ) {
        const incoming = ciIdentifierFetcher.data.ciRuns;
        if (incoming.length === 0) {
          setMoreToLoad(false);
        } else {
          setCiRuns((existing) => mergeAndSortCiRuns(existing, incoming));
        }
      }
    }
  }, [ciIdentifierFetcher]);

  // // When props or fetcher changes, begin polling (and cancel any previous polling)
  useEffect(() => {
    if (ciIdentifier && poll) {
      const id = setInterval(() => {
        if (document.visibilityState === "visible") {
          ciIdentifierFetcher.load(
            `/api/sherlock/get-ci-identifier/${ciIdentifier}?limitCiRuns=3`,
          );
        }
      }, 5 * 1000);
      return () => clearInterval(id);
    }
  }, [ciIdentifier, poll, ciIdentifierFetcher]);

  if (ciRuns.length > 0) {
    return (
      <CiRunResourceLoadedWidget
        ciRuns={ciRuns}
        loadMore={async () => {
          // So Remix's fetcher is almost always what we want to use, because it has some really
          // nice behavior around cancellation and it's aware of Remix navigations.
          // But... that cancellation behavior can actually trip up here if you rip the scroll wheel
          // and send a flurry of requests. The mergeAndSortCiRuns function makes it actually
          // okay for additional ciRuns to be processed out of order, so we get marginally
          // better performance and behavior by dropping down to a basic fetch. That means we have
          // to fudge the types a little bit and duplicate a bit of code, but it's one of those
          // "obviously works" things so I think it's okay.
          await fetch(
            `/api/sherlock/get-ci-identifier/${ciIdentifier}?offsetCiRuns=${ciRuns.length}`,
          )
            .then(
              (response) => response.json(),
              (reason) => console.log(reason),
            )
            .then((json) => {
              if (isReturnedErrorInfo(json)) {
                console.log(json.errorSummary);
                setMoreToLoad(false);
              } else if (isProxiedCiIdentifier(json)) {
                const incoming = json.ciRuns;
                if (!incoming || incoming.length === 0) {
                  setMoreToLoad(false);
                } else {
                  setCiRuns((existing) =>
                    mergeAndSortCiRuns(existing, incoming),
                  );
                }
              }
            });
        }}
        moreToLoad={moreToLoad}
        asChip={asChip}
      />
    );
  } else if (initialLoad) {
    return <CiRunResourceLoadingBox asChip={asChip} />;
  } else {
    return <CiRunResourceNotFoundBox asChip={asChip} />;
  }
};

const CiRunResourceLoadedWidget: React.FunctionComponent<{
  // Typescript can't represent this being non-empty... but there's literally a CiRunResourceNotFoundBox.
  // Expect the caller to use that instead.
  ciRuns: SerializeFrom<SherlockCiRunV3>[];
  loadMore: () => void;
  moreToLoad: boolean;
  asChip: boolean;
}> = ({ ciRuns, loadMore, moreToLoad, asChip }) => {
  const [open, onOpenChange] = useState(false);
  const ciRunToShowOnButton =
    ciRuns.find((ciRun, index, array) => {
      if (ciRun.status != "success") {
        // Check runs earlier in the list (which would have been *later*, more recent in time) to see if
        // this workflow has succeeded since this non-success.
        for (let i = 0; i < index; i++) {
          if (
            array[i].githubActionsOwner == ciRun.githubActionsOwner &&
            array[i].githubActionsRepo == ciRun.githubActionsRepo &&
            array[i].githubActionsWorkflowPath ==
              ciRun.githubActionsWorkflowPath &&
            array[i].status == "success"
          ) {
            return false;
          }
        }

        // If we didn't find a success earlier in the list, this is a current/un-retried non-success,
        // so we show this as the CiRun on the button.
        return true;
      } else {
        // For a plain success here, we never select it at this step. Only if we go through the whole
        // list with no non-successes do we show the most recent success, via the || ciRuns[0] below.
        return false;
      }
    }) || ciRuns[0];

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      openButton={(ref, props) => (
        <CiRunResourceWidgetButton
          ciRun={ciRunToShowOnButton}
          isOpen={open}
          asChip={asChip}
          ref={ref}
          props={props}
        />
      )}
      initialPlacement="right"
      {...CiColors}
    >
      <h3 className="font-light text-3xl">Workflow History</h3>
      <p>
        These are the workflow runs that have self-reported as being related to
        this resource.
      </p>
      <InfiniteScroll
        dataLength={ciRuns.length}
        next={loadMore}
        hasMore={moreToLoad}
        loader={<BeehiveIcon loading className="w-12 h-12 mx-auto" />}
        endMessage={<p>(You've reached the end of the list)</p>}
        height={"50vh"}
      >
        {ciRuns.map((ciRun) => (
          <span
            key={ciRun.id}
            className="flex flex-row gap-3 items-center odd:bg-color-misc-heavy-bg p-3"
          >
            <CiRunStatusIcon ciRun={ciRun} />
            <span className="flex flex-col">
              <span>
                {ciRun.githubActionsOwner}/{ciRun.githubActionsRepo}
              </span>
              <a
                className="font-light text-2xl text-color-header-text underline decoration-color-link-underline w-fit"
                href={`https://github.com/${ciRun.githubActionsOwner}/${ciRun.githubActionsRepo}/actions/runs/${ciRun.githubActionsRunID}/attempts/${ciRun.githubActionsAttemptNumber}`}
                rel="noreferrer"
                target="_blank"
              >
                {githubWorkflowNameFromPath(ciRun.githubActionsWorkflowPath)}
                {": "}
                <span className="font-medium">
                  {prettyStatus(ciRun.status)}
                </span>{" "}
                ↗
              </a>
              <span>
                Started at <PrettyPrintTime time={ciRun.startedAt} />
                {ciRun.githubActionsAttemptNumber &&
                ciRun.githubActionsAttemptNumber > 1
                  ? ` • Attempt ${ciRun.githubActionsAttemptNumber}`
                  : null}
              </span>
            </span>
          </span>
        ))}
      </InfiniteScroll>
    </Popover>
  );
};

const CiRunResourceWidgetButton = forwardRef<
  HTMLButtonElement,
  {
    isOpen: boolean;
    asChip: boolean;
    props: ReturnType<typeof useInteractions>["getReferenceProps"];
    ciRun: SerializeFrom<SherlockCiRunV3>;
  }
>(({ isOpen, asChip, props, ciRun }, ref) =>
  asChip ? (
    <button
      type="button"
      ref={ref}
      className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all px-2 bg-color-near-bg ${CiColors.borderClassName} flex flex-row gap-2 h-8 items-center`}
      {...props()}
    >
      <CiRunStatusIcon ciRun={ciRun} />
      <div className="text-xl font-light">
        {githubWorkflowNameFromPath(
          ciRun.githubActionsWorkflowPath ?? "",
          true,
        )}
        : <span className="font-medium">{prettyStatus(ciRun.status)}</span>
      </div>
    </button>
  ) : (
    <ActionButton
      type="button"
      isHovered={isOpen}
      ref={ref}
      sizeClassName="w-full group"
      icon={<CiRunStatusIcon ciRun={ciRun} />}
      {...CiColors}
      {...props()}
    >
      <div className="flex flex-row items-center gap-2">
        <h2 className="font-light">
          {ciRun.githubActionsRepo}
          {"'s "}
          {githubWorkflowNameFromPath(
            ciRun.githubActionsWorkflowPath ?? "",
          )}: <span className="font-medium">{prettyStatus(ciRun.status)}</span>
        </h2>
        <div className="grow"></div>
        <h2 className="font-light">History</h2>
        <ChevronRight
          className={`shrink-0 stroke-color-header-text transition-transform ${
            isOpen ? "rotate-90" : "group-hover:rotate-90"
          }`}
        />
      </div>
    </ActionButton>
  ),
);
CiRunResourceWidgetButton.displayName = "CiRunResourceWidgetButton";

const CiRunStatusIcon: React.FunctionComponent<{
  ciRun: SerializeFrom<SherlockCiRunV3>;
}> = ({ ciRun }) => {
  switch (ciRun.status) {
    case "queued":
      return (
        <CircleDotDashed className="shrink-0 animate-spin-slow stroke-color-status-gray" />
      );
    case "in_progress":
      return (
        <RefreshCw className="shrink-0 animate-spin-slow stroke-color-status-yellow" />
      );
    case "success":
      return <CheckCircle className="shrink-0 stroke-color-status-green" />;
    case "failure":
      return <XCircle className="shrink-0 stroke-color-status-red" />;
    case "action_required":
      return <AlertCircle className="shrink-0 stroke-color-status-red" />;
    case "skipped":
      return <RedoDot className="shrink-0 stroke-color-status-gray" />;
    case "cancelled":
      return <CircleSlash className="shrink-0 stroke-color-status-gray" />;
    default:
      break;
  }
};

function mergeAndSortCiRuns(
  existing: SerializeFrom<SherlockCiRunV3[]>,
  incoming: SerializeFrom<SherlockCiRunV3[]>,
): SerializeFrom<SherlockCiRunV3[]> {
  const { compare } = Intl.Collator("en-US");
  const toReturn: SerializeFrom<SherlockCiRunV3[]> = Array.from(
    new Map(
      [...existing, ...incoming]
        .filter(
          (ciRun): ciRun is { id: number; startedAt: string } =>
            !!ciRun.id && !!ciRun.startedAt,
        )
        .map((ciRun) => [ciRun.id, ciRun]),
    ).values(),
  ).sort((a, b) => compare(b.startedAt, a.startedAt));

  // If the new list has a different length, return it
  if (existing.length != toReturn.length) {
    return toReturn;
  }
  // If the new list is different at any position, return it
  for (let index = 0; index < existing.length; ++index) {
    if (
      existing[index].id != toReturn[index].id ||
      existing[index].status != toReturn[index].status
    ) {
      return toReturn;
    }
  }
  // Otherwise, return the old list so we don't re-render
  return existing;
}

function prettyStatus(status?: string): string {
  return (
    status
      ?.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") ?? ""
  );
}
