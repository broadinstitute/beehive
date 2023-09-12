import { FillerText } from "~/components/panel-structures/filler-text";

export const GithubActionsDeployHookSidebarFallback: React.FunctionComponent<{
  url?: string;
  filename?: string;
}> = ({ url, filename }) => (
  <FillerText>
    {url && filename ? (
      <>
        Configured to call:{" "}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-color-link-underline"
        >
          {filename}
        </a>
      </>
    ) : (
      <>(configuration missing)</>
    )}
  </FillerText>
);
