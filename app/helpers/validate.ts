export function safeRedirectPath(path: string): string {
  // From security review --
  //    Instead of starting with the protocol, the link starts
  //    with ‘//’ leaving the protocol relative. This bypasses
  //    the application’s checks for a relative URL, and is
  //    interpreted by the browser as
  //    [current protocol]//[the rest of the link].
  // This solution says "if there's two leading slashes, replace
  // as many leading slashes as there are with exactly one".
  // This dodges issues of someone passing three slashes to get
  // around the path correction, etc.
  if (path.startsWith("//")) {
    path = path.replace(/^(\/+)/, "/");
  }
  return path;
}
