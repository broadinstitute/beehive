import { useEffect, useState } from "react";

export const ArgoLinkChip: React.FunctionComponent<{
  chartReleaseName: string;
}> = ({ chartReleaseName }) => {
  const href = `https://ap-argocd.dsp-devops.broadinstitute.org/applications/ap-argocd/${chartReleaseName}`;
  const [errored, setErrored] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);
  useEffect(() => () => controller?.abort(), []);

  if (errored) {
    return (
      <a
        href={href}
        target="_blank"
        className="shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all px-2 flex flex-row h-8 items-center"
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
        src={`/api/argocd/badge?name=${chartReleaseName}`}
        className="h-8 rounded-xl hover:shadow-md motion-safe:transition-all"
        onError={() => setErrored(true)}
      />
    </a>
  );
};
