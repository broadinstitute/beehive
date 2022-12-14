import {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  json,
  redirect,
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
  useTransition,
} from "@remix-run/react";
import tailwindStyles from "./styles/tailwind.css";
import beehiveLoadingStyles from "./styles/beehive-loading.css";
import favicon from "./assets/favicon.svg";
import { commitSession, getSession, sessionFields } from "./session.server";
import { generateNonce } from "./helpers/nonce.server";
import { catchBoundary } from "./components/boundaries/catch-boundary";
import { errorBoundary } from "./components/boundaries/error-boundary";
import { CsrfTokenContext } from "./components/logic/csrf-token";
import { LoadScroller } from "./components/logic/load-scroller";
import { LoadThemeSetter } from "./components/logic/theme";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Beehive",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: beehiveLoadingStyles },
  { rel: "icon", href: favicon, type: "image/svg+xml" },
];

interface LoaderData {
  csrfToken: string;
  cspScriptNonce: string;
}

export const loader: LoaderFunction = async ({ request }) => {
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
  session.set(sessionFields.githubOAuthState, generateNonce());
  if (!session.has(sessionFields.githubAccessToken)) {
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

  // Update CSRF token
  session.set(sessionFields.csrfToken, generateNonce());
  return json<LoaderData>(
    {
      csrfToken: session.get(sessionFields.csrfToken),
      cspScriptNonce: generateNonce(),
    },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
};

export const shouldRevalidate: ShouldRevalidateFunction = () => false;

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

export const App: React.FunctionComponent = () => {
  let { csrfToken, cspScriptNonce } = useLoaderData<LoaderData>();
  if (typeof window !== "undefined") {
    // https://html.spec.whatwg.org/multipage/urls-and-fetching.html#nonce-attributes
    // When this code runs in the browser, we want the nonce to be empty because
    // that's what it will be regardless of what we do. If we have it anything other
    // than an empty string, React's will warn us about about a mismatch.
    cspScriptNonce = "";
  }
  const transition = useTransition();
  return (
    <CsrfTokenContext.Provider value={csrfToken}>
      <html
        lang="en"
        // suppressHydrationWarning to allow LoadThemeSetter's manipulation of the
        // document's data-theme attribute. Suppressing is okay because it only
        // works at this level (it doesn't cascade).
        suppressHydrationWarning={true}
      >
        <head>
          <Meta />
          <Links />
          <LoadThemeSetter nonce={cspScriptNonce} />
        </head>
        <body
          data-theme-prod={false}
          className={`bg-color-far-bg overflow-hidden flex flex-col min-w-screen h-screen w-full ${
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
    </CsrfTokenContext.Provider>
  );
};

export default App;
