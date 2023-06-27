import { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { V2controllersChangeset } from "@sherlock-js-client/sherlock";
import { Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { Popover } from "~/components/interactivity/popover";
import { CsrfTokenInput } from "~/components/logic/csrf-token";
import { ChartReleaseColors } from "../../chart-releases/chart-release-colors";

export const ChangsetRecreateButton: React.FunctionComponent<{
  changeset: V2controllersChangeset | SerializeFrom<V2controllersChangeset>;
}> = ({ changeset }) => {
  const [open, onOpenChange] = useState(false);

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data != null) {
      onOpenChange(false);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      openButton={(ref, props) => (
        <ActionButton
          type="button"
          ref={ref}
          isHovered={open}
          sizeClassName="w-fit"
          icon={<Undo2 className="stroke-color-body-text" />}
          {...ChartReleaseColors}
          {...props()}
        >
          <h2 className="font-medium">Deploy These Versions Again</h2>
        </ActionButton>
      )}
      {...ChartReleaseColors}
    >
      <h3 className="font-light text-3xl">Deploy These Versions Again</h3>
      <fetcher.Form
        className={`flex flex-col gap-4 rounded-2xl p-6 border-2 ${ChartReleaseColors.borderClassName} ${ChartReleaseColors.backgroundClassName}`}
        method="post"
        action="/api/sherlock/recreate-changeset"
      >
        <h2 className="font-light text-2xl">
          Set {changeset.chartRelease} to app{" "}
          {changeset.toAppVersionExact ?? "(none)"} and chart{" "}
          {changeset.toChartVersionExact ?? "(none)"}?
        </h2>
        <p>
          This operation will prepare a new version change from whatever{" "}
          {changeset.chartRelease} is at now to the end-state of this version
          change, app {changeset.toAppVersionExact ?? "(none)"} and chart{" "}
          {changeset.toChartVersionExact ?? "(none)"}.
        </p>
        <p>
          This is like a revert, and carries the associated risks: it's possible
          that the database or configuration could have changed such that these
          older versions wouldn't work anymore.
        </p>
        <p>
          If you're wanting to inspect, restart, or otherwise fiddle with the
          actual deployment, head over to{" "}
          <a
            href={`https://ap-argocd.dsp-devops.broadinstitute.org/applications/ap-argocd/${changeset.chartRelease}`}
            target="_blank"
            className="underline decoration-color-link-underline"
            rel="noreferrer"
          >
            Argo CD ↗
          </a>{" "}
          for that (feel free to reach out to DevOps for help).
        </p>
        <input
          type="hidden"
          name="changeset"
          value={changeset?.id?.toString()}
        />
        <ActionButton
          size="fill"
          type="submit"
          isLoading={fetcher.state !== "idle"}
          {...ChartReleaseColors}
        >
          Plan a Re-Deployment
        </ActionButton>
        <CsrfTokenInput />
      </fetcher.Form>
    </Popover>
  );
};
