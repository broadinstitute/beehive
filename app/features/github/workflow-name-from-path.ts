export function githubWorkflowNameFromPath(
  path?: string,
  truncate?: boolean,
): string {
  const split = (path ?? "").split("/");
  const toReturn = split[split.length - 1].replace(/\.[^/.]+$/, "");
  if (truncate && toReturn.length > 23) {
    return toReturn.slice(0, 20) + "...";
  } else {
    return toReturn;
  }
}
