import { Book } from "lucide-react";
import { LinkChip } from "~/components/interactivity/link-chip";
import { ChartColors } from "./chart-colors";

export const ChartLinkChip: React.FunctionComponent<{
  chart: string;
  arrow?: boolean;
}> = ({ chart, arrow }) => (
  <LinkChip
    text={`Chart: ${chart}`}
    arrow={arrow}
    to={`/charts/${chart}`}
    {...ChartColors}
  />
);

export const PlaybookLinkChip: React.FunctionComponent<{
  playbookURL: string;
}> = ({ playbookURL }) => (
  <LinkChip
    text={
      <>
        <Book className="inline-block align-middle mb-1" size={18} /> Playbook
      </>
    }
    to={
      playbookURL.startsWith("https://")
        ? playbookURL
        : `https://${playbookURL}`
    }
    target="_blank"
    arrow
    {...ChartColors}
  />
);

export const SonarCloudLinkChip: React.FunctionComponent<{
  repo: string;
}> = ({ repo }) => {
  const projectKey = repo.replaceAll("/", "_");
  return (
    <a
      href={`https://sonarcloud.io/summary/new_code?id=${projectKey}`}
      target="_blank"
      rel="noreferrer"
    >
      <img
        src={`https://sonarcloud.io/api/project_badges/measure?project=${projectKey}&metric=alert_status`}
        className="h-8 w-full rounded-xl hover:shadow-md motion-safe:transition-shadow"
        alt="SonarCloud Alert Status"
      />
    </a>
  );
};
