import { Github } from "lucide-react";
import { LinkChip } from "~/components/interactivity/link-chip";
import { GithubColors } from "./github-colors";

export const GithubLinkChip: React.FunctionComponent<{
  repo: string;
}> = ({ repo }) => (
  <LinkChip
    text={
      <>
        <Github className="inline-block align-middle mb-1" size={18} /> GitHub:{" "}
        {repo.split("/").pop()}
      </>
    }
    target="_blank"
    to={`https://github.com/${repo}`}
    arrow
    {...GithubColors}
  />
);
