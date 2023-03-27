import React from "react";

export interface PrettyPrintDescriptionProps {
  description: string;
  repo?: string;
  jira?: string;
  className?: string;
}

export const PrettyPrintDescription: React.FunctionComponent<
  PrettyPrintDescriptionProps
> = ({ description, repo, jira = "broadworkbench", className }) => (
  <span className={className}>
    {description
      .split(
        /((?:\[?[A-Z]+-[0-9]+\]?)|(?:\(?#[0-9]+\)?)|(?:\[[^\]]+\]\(https?:\/\/[\w\d./?\-=#&]+\)))/g
      )
      .map((string): React.ReactNode => {
        const ticketMatch = /([A-Z]+-[0-9]+)/.exec(string);
        if (jira && ticketMatch) {
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
        if (repo && prMatch) {
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
        const linkMatch = /\[([^\]]+)\]\((https?:\/\/[\w\d./?\-=#&]+)\)/.exec(
          string
        );
        if (linkMatch && linkMatch.length >= 2) {
          return (
            <a
              href={linkMatch[2]}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-color-link-underline"
            >
              {linkMatch[1]}
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
