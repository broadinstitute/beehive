// See discussion at https://github.com/remix-run/remix/issues/183
export function getContentSecurityPolicy(nonce?: string | undefined): string {
  const self =
    process.env.NODE_ENV === "development"
      ? "'self' http://localhost:*"
      : "'self'";

  const scriptSrc =
    typeof nonce === "string" && nonce.length > 0
      ? `${self} 'report-sample' 'nonce-${nonce}'`
      : `${self} 'report-sample'`;

  const connectSrc =
    process.env.NODE_ENV === "development"
      ? `${self} ws://localhost:*`
      : `${self}`;

  return (
    `default-src ${self}; ` +
    `script-src ${scriptSrc}; ` +
    `style-src ${self} 'report-sample'; ` +
    `img-src ${self} data: https://sonarcloud.io https://a.slack-edge.com; ` +
    `font-src ${self}; ` +
    `connect-src ${connectSrc}; ` +
    `media-src ${self}; ` +
    "object-src 'none'; " +
    `prefetch-src ${self}; ` +
    `child-src ${self}; ` +
    `frame-src ${self}; ` +
    `worker-src ${self} blob:; ` +
    "frame-ancestors 'none'; " +
    `form-action ${self}; ` +
    `base-uri ${self}; ` +
    `manifest-src ${self}; ` +
    "upgrade-insecure-requests; " +
    "block-all-mixed-content "
  );
}
