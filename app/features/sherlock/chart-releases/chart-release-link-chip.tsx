import { useEffect, useState } from "react";
import { LinkChip } from "~/components/interactivity/link-chip";
import { ChartReleaseColors } from "./chart-release-colors";

export const ChartReleaseLinkChip: React.FunctionComponent<{
  chartRelease: string;
  chart: string;
  environment: string;
  arrow?: boolean;
}> = ({ chartRelease, chart, environment, arrow }) => (
  <LinkChip
    text={`Chart Release: ${chartRelease}`}
    arrow={arrow}
    to={`/environments/${environment}/chart-releases/${chart}`}
    {...ChartReleaseColors}
  />
);

export const ArgoLinkChip: React.FunctionComponent<{
  chartRelease: string;
}> = ({ chartRelease }) => {
  const href = `https://ap-argocd.dsp-devops.broadinstitute.org/applications/ap-argocd/${chartRelease}`;
  const [errored, setErrored] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);
  useEffect(() => () => controller?.abort(), []);

  if (errored) {
    return (
      <a
        href={href}
        target="_blank"
        className="shrink-0 border border-color-neutral-soft-border rounded-xl hover:shadow-md motion-safe:transition-all px-2 flex flex-row h-8 w-fit items-center"
        onClick={() => {
          if (!controller) {
            setController(new AbortController());
          }
          document.addEventListener(
            "visibilitychange",
            () => {
              if (document.visibilityState === "visible") {
                setErrored(false);
                controller?.abort();
              }
            },
            { signal: controller?.signal }
          );
        }}
      >
        <h2 className="text-xl font-light">ArgoCD - View</h2>
      </a>
    );
  }
  return (
    <a href={href} target="_blank">
      <img
        src={`/api/argocd/badge?name=${chartRelease}`}
        className="h-8 w-fit rounded-xl hover:shadow-md motion-safe:transition-all"
        onError={() => setErrored(true)}
      />
    </a>
  );
};
