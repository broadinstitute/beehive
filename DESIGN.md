# Design

The guiding principle of Beehive is that it's a UI for [Sherlock](https://github.com/broadinstitute/sherlock). **It's part of the DevOps platform, _not_ part of Terra.**

Sherlock is thoroughly tested and carefully designed. To be blunt, the standards here are lower. UI work isn't our team's specialty, so a lot of Beehive's design is about Beehive _not_ doing things. Some examples:

-   Beehive doesn't include any significant business logic: if we care about the behavior, we write it in Sherlock
-   Beehive doesn't handle authentication or authorization: it runs behind Identity Aware Proxy and passes that through to Sherlock
-   Beehive doesn't define models or many types at all: we rely on Sherlock's TypeScript client library
-   Beehive doesn't manage state, routing, or data loading: we use Remix
-   Beehive doesn't have custom CSS wherever possible: we use Tailwind

## Architecture

The DevOps platform is currently being re-architected for improved security. The existing architecture diagram is [here](https://lucid.app/lucidchart/0b274518-4e5a-449e-b3bc-19714096d5a4/edit?viewport_loc=-2982%2C57%2C5242%2C2868%2C0_0&invitationId=inv_e6f26c4c-902a-4335-b9b8-cc8d4363e66f).

The summary is that Beehive and Sherlock run in the same clusters, with their respective ingresses configured with the same Identity Aware Proxy. Beehive passes requests to Sherlock post-IAP _inside the cluster_. Sherlock handles authentication and authorization.

Beehive truly runs inside the cluster: Remix integrates both backend and frontend. [Remix's docs have more info.](https://remix.run/docs/en/main/discussion/introduction)

## Repository Layout

-   `./app/assets`: Static assets for Remix to bundle and cache-bust
-   `./app/components`: General-purpose reusable components matching Beehive's styling
-   `./app/errors`: Error handling components and helpers
-   `./app/features`: Components and helpers for specific features, e.g. `./app/features/sherlock/environments` for Sherlock environments
-   `./app/helpers`: Helper functions, primarily for use server-side
-   `./app/hooks`: Custom React hooks
-   `./app/routes`: One file for each page Beehive serves
-   `./app/styles`: CSS for Remix to handle with PostCSS and cache-bust
-   `./app/themes`: theme-specific CSS for Remix to bundle and cache-bust

`./app` itself contains execution entrypoints for both client and server, but it's `root.tsx` generally makes more sense as the starting point for the application.

## Stack

-   TypeScript: Remix has good support for it and we inherit from Sherlock's types
-   NPM: We don't need complexity offered by anything else
-   React: Standard in DSP
    -   TSX Syntax: All available documentation for other parts of the stack all used TSX (and it's become more standard in DSP since)
-   [Remix](https://remix.run/): Framework pairing perfectly [with Sherlock](https://remix.run/docs/en/main/guides/bff) and [its hierarchical model structure](https://remix.run/docs/en/main/start/tutorial#nested-routes-and-outlets)
-   [Tailwind](https://tailwindcss.com/): Good-enough styling and flexibility coupled with excellent documentation for a team that isn't concerned with CSS
-   [Lucide](https://lucide.dev/): Good-enough collection of tons of icons coupled with excellent documentation for a team that isn't concerned with graphic design

## Themes

Themes aren't just a vanity feature, they're actually a core part of how Beehive helps folks avoid accidental modifications to production -- the theme will flip from light mode to dark mode or vice-versa when moving into a part of the app that directly impacts production.

There's more information available in [`./app/themes`](./app/themes/README.md).
