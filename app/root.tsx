import {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
  json,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import tailwindStyles from "./styles/tailwind.css";
import beehiveLoadingStyles from "./styles/beehive-loading.css";
import favicon from "./assets/favicon.svg";
import {
  commitSession,
  getOrSetSessionNonce,
  getSession,
  sessionFields,
} from "./sessions.server";
import { AuthenticityTokenProvider } from "remix-utils";
import { LoadScroller } from "./routes/__layout";
import { generateNonce } from "./helpers/nonce.server";
import { catchBoundary } from "./components/boundaries/catch-boundary";
import { errorBoundary } from "./components/boundaries/error-boundary";
import { createContext } from "react";
import { CsrfTokenContext } from "./components/logic/csrf-token";

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

  if (!session.has(sessionFields.csrfToken)) {
    session.set(sessionFields.csrfToken, generateNonce());
  }
  if (!session.has(sessionFields.cspScriptNonce)) {
    session.set(sessionFields.cspScriptNonce, generateNonce());
  }
  return json<LoaderData>(
    {
      csrfToken: session.get(sessionFields.csrfToken),
      cspScriptNonce: session.get(sessionFields.cspScriptNonce),
    },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
};

export const unstable_shouldReload = () => false;

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

export const App: React.FunctionComponent = () => {
  let { csrfToken, cspScriptNonce } = useLoaderData<LoaderData>();
  if (typeof window !== "undefined") {
    // https://html.spec.whatwg.org/multipage/urls-and-fetching.html#nonce-attributes
    // When this code runs in the browser, we want the nonce to be empty because
    // that's what it will be regardless of what we do. If we have it anything other
    // than an empty string, React's dev mode will warn us about a
    cspScriptNonce = "";
  }
  return (
    <CsrfTokenContext.Provider value={csrfToken}>
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body className="bg-zinc-100 flex flex-col min-w-screen h-screen w-full">
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
