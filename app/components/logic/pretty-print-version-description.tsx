import React from "react";

export interface PrettyPrintVersionDescriptionProps {
  description: string;
  repo?: string;
  jira?: string;
}

export const PrettyPrintVersionDescription: React.FunctionComponent<
  PrettyPrintVersionDescriptionProps
> = ({ description, repo, jira = "broadworkbench" }) => (
  <span>
    {description
      .split(/((?:\[?[A-Z]+-[0-9]+\]?)|(?:\(?#[0-9]+\)?))/g)
      .map((string): React.ReactNode => {
        const ticketMatch = /([A-Z]+-[0-9]+)/.exec(string);
        if (ticketMatch) {
          return (
            <a
              href={`https://${jira}.atlassian.net/browse/${ticketMatch[1]}`}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-color-link-underline"
            >
              {string}
            </a>
          );
        }
        const prMatch = /#([0-9]+)/.exec(string);
        if (prMatch) {
          return (
            <a
              href={`https://github.com/${repo}/pull/${prMatch[1]}`}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-color-link-underline"
            >
              {string}
            </a>
          );
        }
        return string;
      })
      .map((node, index) => (
        <React.Fragment key={index}>{node}</React.Fragment>
      ))}
  </span>
);
