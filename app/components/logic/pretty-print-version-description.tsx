export interface PrettyPrintVersionDescriptionProps {
  description: string;
  repo?: string | undefined;
  jira?: string | undefined;
}

export const PrettyPrintVersionDescription: React.FunctionComponent<
  PrettyPrintVersionDescriptionProps
> = ({ description, repo, jira = "broadworkbench" }) => {
  const links = [
    ...Array.from(description.matchAll(/([A-Z]+-[0-9]+)/g), (m) => m[1]).map(
      (ticket) => [`https://${jira}.atlassian.net/browse/${ticket}`, ticket]
    ),
    ...(repo
      ? Array.from(description.matchAll(/#([0-9]+)/g), (m) => m[1]).map(
          (pr) => [`https://github.com/${repo}/pull/${pr}`, `#${pr}`]
        )
      : []),
  ];
  return (
    <span>
      {description
        .replace(/[^a-zA-Z]?[A-Z]+-[0-9]+[^a-zA-Z]?/g, "")
        .replace(/\(#[0-9]+\)/g, "")
        .trim()
        .replace(/\s+/g, " ")}
      {links && (
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
    </span>
  );
};
