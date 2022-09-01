import { MetaFunction, LinksFunction, LoaderFunction, json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import Header from "./components/header";
import styles from "./tailwind.css";
import favicon from "./assets/favicon.svg"
import { FunctionComponent } from "react";
import { commitSession, getSession } from "./sessions.server";
import { AuthenticityTokenProvider, createAuthenticityToken } from "remix-utils";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Beehive",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: favicon, type: "image/svg+xml" }
]

interface LoaderData {
  csrf: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"))
  const token = createAuthenticityToken(session)
  return json<LoaderData>(
    { csrf: token },
    { headers: { "Set-Cookie": await commitSession(session) } }
  )
}

const App: FunctionComponent = () => {
  const { csrf } = useLoaderData<LoaderData>()
  return (
    <AuthenticityTokenProvider token={csrf}>
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body className="bg-zinc-100 flex flex-col h-screen w-screen max-w-full">
          <Header />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </AuthenticityTokenProvider>
  )
}


export default App
