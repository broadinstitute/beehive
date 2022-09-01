import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage({
        cookie: {
            // See Cookie Prefixes at https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#define_where_cookies_are_sent
            name: `${process.env.NODE_ENV === "production" ? "__HOST-" : ""}beehive_session`,
            path: "/",
            secure: process.env.NODE_ENV === "production",

            // See SameSite attribute at https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#define_where_cookies_are_sent
            sameSite: "strict",

            // See HttpOnly attribute at https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security
            httpOnly: true,

            // Set COOKIE_SIGNING_SECRET when deployed to prevent client-side cookie modification
            secrets: [process.env.NODE_ENV === "production" ? process.env.COOKIE_SIGNING_SECRET! : "development"]
        }
    })

export { getSession, commitSession, destroySession }
