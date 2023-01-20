import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      // See Cookie Prefixes at https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#define_where_cookies_are_sent
      name: `${
        process.env.NODE_ENV === "production" ? "__HOST-" : ""
      }beehive_session`,
      path: "/",

      // See Secure attribute at https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
      secure: process.env.NODE_ENV === "production",

      // See SameSite attribute at https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#define_where_cookies_are_sent
      // We can't use 'strict' because we need to store the GitHub OAuth state client-side in this cookie--we need the
      // cookie loaded when we handle the redirect from GitHub.
      sameSite: "lax",

      // See HttpOnly attribute at https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security
      httpOnly: true,

      // COOKIE_SIGNING_SECRET used to protect against cookie tampering
      secrets: [process.env.COOKIE_SIGNING_SECRET!],
    },
  });

export { getSession, commitSession, destroySession };

export const sessionFields = {
  csrfToken: "csrfToken",
  githubOAuthState: "githubOAuthState",
  githubAccessToken: "githubAccessToken",
  flashNotifications: "flashNotification",
  pdToken: "pdToken",
};
