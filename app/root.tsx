import type { MetaFunction, LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Header from "./components/header";
import styles from "./tailwind.css";
import favicon from "./assets/favicon.svg"
import { FunctionComponent } from "react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Beehive",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: favicon, type: "image/svg+xml" }
]

const App: FunctionComponent = () =>
  <html lang="en">
    <head>
      <Meta />
      <Links />
    </head>
    <body className="bg-zinc-100 flex flex-col h-screen w-screen">
      <Header />
      <Outlet />
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </body>
  </html>

export default App
