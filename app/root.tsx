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
import { FunctionComponent } from "react";
import { commitSession, getSession } from "./sessions.server";
import {
  AuthenticityTokenProvider,
  createAuthenticityToken,
} from "remix-utils";
import { LoadScroller } from "./routes/__layout";
import { generateNonce } from "./csp.server";

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

export interface RootLoaderData {
  csrf: string;
  cspScriptNonce: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  return json<RootLoaderData>(
    { csrf: createAuthenticityToken(session), cspScriptNonce: generateNonce() },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
};

export const unstable_shouldReload = () => false;

const App: FunctionComponent = () => {
  let { csrf, cspScriptNonce } = useLoaderData<RootLoaderData>();
  if (typeof window !== "undefined") {
    // https://html.spec.whatwg.org/multipage/urls-and-fetching.html#nonce-attributes
    // When this code runs in the browser, we want the nonce to be empty because
    // that's what it will be regardless of what we do. If we have it anything other
    // than an empty string, React's dev mode will warn us about a
    cspScriptNonce = "";
  }
  return (
    <AuthenticityTokenProvider token={csrf}>
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
    </AuthenticityTokenProvider>
  );
};

export default App;
