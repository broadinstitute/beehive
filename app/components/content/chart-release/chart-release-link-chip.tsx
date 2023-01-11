export const ArgoLinkChip: React.FunctionComponent<{
  chartReleaseName: string;
}> = ({ chartReleaseName }) => (
  <a
    href={`https://ap-argocd.dsp-devops.broadinstitute.org/applications/ap-argocd/${chartReleaseName}`}
    target="_blank"
  >
    <img
      src={`https://ap-argocd.dsp-devops.broadinstitute.org/api/badge?name=${chartReleaseName}`}
      className="h-8 rounded-xl hover:shadow-md motion-safe:transition-all"
    />
  </a>
);
