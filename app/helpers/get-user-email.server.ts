// not suitable for security behavior because this function doesn't get this info from the JWT,
// but it's okay for UI polish
export function getUserEmail(request: Request) {
  return (
    // https://cloud.google.com/iap/docs/identity-howto#getting_the_users_identity_with_signed_headers
    request.headers.get("X-Goog-Authenticated-User-Email")?.split(":").at(-1) ||
    null
  );
}
