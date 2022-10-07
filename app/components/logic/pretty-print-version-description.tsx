export interface PrettyPrintVersionDescriptionProps {
  description: string;
  repo?: string;
  jira?: string;
}

export const PrettyPrintVersionDescription: React.FunctionComponent<
  PrettyPrintVersionDescriptionProps
> = ({ description, repo, jira = "broadworkbench" }) => {
  const links: string[][] = [
    ...Array.from(description.matchAll(/([A-Z]+-\d+)/g), (m) => m[1]).map(
      (ticket) => [`https://${jira}.atlassian.net/browse/${ticket}`, ticket]
    ),
    ...(repo
      ? Array.from(description.matchAll(/#(\d+)/g), (m) => m[1]).map((pr) => [
          `https://github.com/${repo}/pull/${pr}`,
          `#${pr}`,
        ])
      : []),
  ];
  return (
    <>
      {description
        .replace(/[^a-zA-Z]?[A-Z]+-\d+[^a-zA-Z]?/g, "")
        .replace(/\(#\d+\)/g, "")
        .trim()
        .replace(/\s+/g, " ") || "(empty description)"}
      {links.length > 0 && (
        <>
          {" ("}
          {links.map(([link, text], index) => [
            index > 0 && ", ",
            <a
              key={index}
              href={link}
              target="_blank"
              className="underline decoration-blue-500"
            >
              {`${text} ↗`}
            </a>,
          ])}
          {")"}
        </>
      )}
    </>
  );
};
