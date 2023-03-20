import {
  json,
  LinksFunction,
  LoaderArgs,
  redirect,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  ShouldRevalidateFunction,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { UsersApi } from "@sherlock-js-client/sherlock";
import React from "react";
import favicon from "./assets/favicon.svg";
import { CsrfTokenContext } from "./components/logic/csrf-token";
import { LoadScroller } from "./components/logic/load-scroller";
import { PagerdutyTokenContext } from "./components/logic/pagerduty-token";
import { LoadThemeSetter } from "./components/logic/theme";
import { PanelErrorBoundary } from "./errors/components/error-boundary";
import {
  forwardIAP,
  SherlockConfiguration,
} from "./features/sherlock/sherlock.server";
import { generateNonce } from "./helpers/nonce.server";
import { commitSession, getSession, sessionFields } from "./session.server";
import beehiveLoadingStyles from "./styles/beehive-loading.css";
import tailwindStyles from "./styles/tailwind.css";

export const meta: V2_MetaFunction = () => [
  {
    title: "Beehive",
  },
];

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: beehiveLoadingStyles },
  { rel: "icon", href: favicon, type: "image/svg+xml" },
];

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  let requestUrl = new URL(request.url);

  // If we're behind a proxy, make our URL whatever the user actually entered
  if (
    request.headers.get("X-Forwarded-Proto") &&
    request.headers.get("X-Forwarded-Host")
  ) {
    requestUrl.href =
      request.headers.get("X-Forwarded-Proto") +
      "://" +
      request.headers.get("X-Forwarded-Host") +
      requestUrl.pathname +
      requestUrl.search +
      requestUrl.hash;
  }

  // Handle redirect from GitHub OAuth
  if (requestUrl.searchParams.has("code")) {
    if (!requestUrl.searchParams.has("state")) {
      throw new Response(
        `GitHub OAuth issue; "code" was passed but "state" was not`,
        { status: 400 }
      );
    } else if (!session.has(sessionFields.githubOAuthState)) {
      throw new Response(
        `GitHub OAuth issue; "code" was passed but "${sessionFields.githubOAuthState}" was not in the session`,
        { status: 400 }
      );
    } else if (
      requestUrl.searchParams.get("state") !==
      session.get(sessionFields.githubOAuthState)
    ) {
      throw new Response(
        `GitHub OAuth issue; "code" was passed but "state" and session "${sessionFields.githubOAuthState}" didn't match`,
        { status: 400 }
      );
    } else {
      const githubTokenURL = new URL(
        "https://github.com/login/oauth/access_token"
      );
      githubTokenURL.searchParams.append(
        "client_id",
        process.env.GITHUB_CLIENT_ID || ""
      );
      githubTokenURL.searchParams.append(
        "client_secret",
        process.env.GITHUB_CLIENT_SECRET || ""
      );
      githubTokenURL.searchParams.append(
        "code",
        requestUrl.searchParams.get("code") || ""
      );
      return await fetch(githubTokenURL.href, {
        headers: { Accept: "application/json" },
      })
        .then(async (response) => {
          if (response.status !== 200) {
            throw new Response(
              `GitHub OAuth issue; GitHub rejected the code with status ${
                response.status
              }: ${await response.text()}`
            );
          } else {
            return await response.json();
          }
        })
        .then(async (data) => {
          if (!data?.access_token) {
            console.log(
              `GitHub OAuth issue; GitHub didn't return an access_token: ${JSON.stringify(
                data
              )}`
            );
            throw new Response(
              "GitHub OAuth issue; GitHub didn't return an access_token"
            );
          } else {
            session.set(sessionFields.githubAccessToken, data.access_token);

            // Update Google/GitHub account linking in Sherlock but don't await it!
            // We don't need the output of this at all, we just want it to happen at
            // some point.
            new UsersApi(SherlockConfiguration)
              .apiV2ProceduresUsersLinkGithubPost(
                {
                  githubAccessPayloadRequest: {
                    githubAccessToken: data.access_token,
                  },
                },
                forwardIAP(request)
              )
              .then(
                (user) =>
                  console.log(
                    `updated Sherlock account linking, ${user.email} = ${user.githubUsername}`
                  ),
                (reason) =>
                  console.log(
                    `failed to update Sherlock account linking, ${reason}`
                  )
              );

            requestUrl.searchParams.delete("code");
            requestUrl.searchParams.delete("state");
            return redirect(requestUrl.href, {
              headers: { "Set-Cookie": await commitSession(session) },
            });
          }
        });
    }
  }

  // Start GitHub OAuth
  if (!session.has(sessionFields.githubAccessToken)) {
    session.set(sessionFields.githubOAuthState, generateNonce());
    const githubAuthorizeURL = new URL(
      "https://github.com/login/oauth/authorize"
    );
    githubAuthorizeURL.searchParams.append(
      "client_id",
      process.env.GITHUB_CLIENT_ID || ""
    );
    githubAuthorizeURL.searchParams.append("redirect_uri", requestUrl.href);
    githubAuthorizeURL.searchParams.append("scope", "repo");
    githubAuthorizeURL.searchParams.append(
      "state",
      session.get(sessionFields.githubOAuthState)
    );
    githubAuthorizeURL.searchParams.append("allow_signup", "false");
    return redirect(githubAuthorizeURL.href, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  // Update tokens
  if (!session.has(sessionFields.csrfToken)) {
    session.set(sessionFields.csrfToken, generateNonce());
  }
  if (!session.has(sessionFields.pdToken)) {
    session.set(sessionFields.pdToken, generateNonce());
  }

  return json(
    {
      csrfToken: session.get(sessionFields.csrfToken),
      pdToken: session.get(sessionFields.pdToken),
      cspScriptNonce: generateNonce(),
    },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = () => false;

export const ErrorBoundary = PanelErrorBoundary;

export const App: React.FunctionComponent = () => {
  let { csrfToken, pdToken, cspScriptNonce } = useLoaderData<typeof loader>();
  if (typeof window !== "undefined") {
    // https://html.spec.whatwg.org/multipage/urls-and-fetching.html#nonce-attributes
    // When this code runs in the browser, we want the nonce to be empty because
    // that's what it will be regardless of what we do. If we have it anything other
    // than an empty string, React's will warn us about about a mismatch.
    cspScriptNonce = "";
  }
  const transition = useNavigation();
  return (
    <React.StrictMode>
      <CsrfTokenContext.Provider value={csrfToken}>
        <PagerdutyTokenContext.Provider value={pdToken}>
          <html
            lang="en"
            // suppressHydrationWarning to allow LoadThemeSetter's manipulation of the
            // document's data-theme attribute. Suppressing is okay because it only
            // works at this level (it doesn't cascade).
            suppressHydrationWarning={true}
          >
            <head>
              <meta charSet="utf-8" />
              <meta
                name="viewport"
                content="width=device-width,initial-scale=1,viewport-fit=cover"
              />
              <Meta />
              <Links />
              <LoadThemeSetter nonce={cspScriptNonce} />
            </head>
            <body
              data-theme-prod={false}
              className={`bg-color-far-bg overflow-hidden flex flex-col min-w-screen h-[100dvh] w-full ${
                transition.state != "idle" ? "cursor-progress" : ""
              }`}
            >
              <Outlet />

              <LoadScroller nonce={cspScriptNonce} />
              <ScrollRestoration nonce={cspScriptNonce} />
              <Scripts nonce={cspScriptNonce} />
              <LiveReload nonce={cspScriptNonce} />
            </body>
          </html>
        </PagerdutyTokenContext.Provider>
      </CsrfTokenContext.Provider>
    </React.StrictMode>
  );
};

export default App;
