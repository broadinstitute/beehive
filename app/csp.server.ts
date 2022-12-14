// See discussion at https://github.com/remix-run/remix/issues/183
export function getContentSecurityPolicy(nonce?: string | undefined): string {
  let scriptSrc: string;
  if (typeof nonce === "string" && nonce.length > 0) {
    scriptSrc = `'self' 'report-sample' 'nonce-${nonce}'`;
  } else if (process.env.NODE_ENV === "development") {
    // Allow unsafe-inline at dev time, since the LiveReload script can show up
    // in expected places (like root boundaries) where we can't load a nonce.
    scriptSrc = "'self' 'report-sample' 'unsafe-inline'";
  } else {
    scriptSrc = "'self' 'report-sample'";
  }

  const connectSrc =
    process.env.NODE_ENV === "development"
      ? "'self' ws://localhost:*"
      : "'self'";

  return (
    "default-src 'self'; " +
    `script-src ${scriptSrc}; ` +
    "style-src 'self' 'report-sample'; " +
    "img-src 'self' https://ap-argocd.dsp-devops.broadinstitute.org data:; " +
    "font-src 'self'; " +
    `connect-src ${connectSrc}; ` +
    "media-src 'self'; " +
    "object-src 'none'; " +
    "prefetch-src 'self'; " +
    "child-src 'self'; " +
    "frame-src 'self'; " +
    "worker-src 'self' blob:; " +
    "frame-ancestors 'none'; " +
    "form-action 'self'; " +
    "base-uri 'self'; " +
    "manifest-src 'self'; " +
    "upgrade-insecure-requests; " +
    "block-all-mixed-content "
  );
}
