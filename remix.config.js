/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverModuleFormat: "cjs",
  serverDependenciesToBundle: [
    /^remix-utils.*/,
    /^@octokit\/.*/,
    "universal-user-agent",
    "before-after-hook",
  ],
};
