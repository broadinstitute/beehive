/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  postcss: true,
  tailwind: true,
  serverModuleFormat: "cjs",
  future: {
    v2_meta: true,
    v2_errorBoundary: true,
    v2_routeConvention: true,
    v2_normalizeFormMethod: true,
    unstable_dev: true,
  },
};
