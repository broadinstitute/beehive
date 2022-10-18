# Beehive

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=broadinstitute_beehive&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=broadinstitute_beehive)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=broadinstitute_beehive&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=broadinstitute_beehive)
[![Bump, Tag, and Publish](https://github.com/broadinstitute/beehive/actions/workflows/build.yaml/badge.svg)](https://github.com/broadinstitute/beehive/actions/workflows/build.yaml)

## Getting set up

1. Grab [Node 18](https://nodejs.org/en/download)

2. Clone this repo

3. Run `./setup-env.bash` to pull down the info needed to do local GitHub auth

4. Run `npm install` to download dependencies and `npm run dev` to spin up the development server

You'll probably want a local instance of Sherlock running -- `make local-up` from inside Sherlock's repo will get you set up.

If you're using Visual Studio Code, Tailwind has a [small plugin](https://tailwindcss.com/docs/editor-setup#intelli-sense-for-vs-code) that provides really good autocomplete.

## Stack

<details>
<summary>
TypeScript
</summary>

We're just building a UI here--we already have a backend that does the business logic, [Sherlock](https://github.com/broadinstitute/sherlock).

We're using TypeScript over JavaScript for many of the same reasons [Terra UI](https://github.com/DataBiosphere/terra-ui) has [considered](https://docs.google.com/document/d/1tX1tGULDnWnWOCzez5WWTSXJFCHxB98rrU07B5u8KNk/edit#heading=h.shrc0akkyq24). In our case, we're starting fresh and the other tooling in this stack has [really good support for it](https://remix.run/docs/en/v1/guides/typescript), so we have fewer downsides to using it.

</details>

<details>
<summary>
NPM
</summary>

We're using NPM over Yarn because NPM is the default and we don't currently have a need to Yarn's extra complexity--we can always move to it later.

</details>

<details>
<summary>
React
</summary>

We're using React because DSP already uses it for [Terra UI](https://github.com/DataBiosphere/terra-ui) and [DUOS UI](https://github.com/DataBiosphere/duos-ui), and we have similar requirements for interactivity--no need to reinvent the wheel.

</details>

<details>
<summary>
Remix
</summary>

[Remix](https://remix.run/) is a data loading and rendering framework for React. There's two older, larger competitors, [Gatsby](https://www.gatsbyjs.com/) (which I've used) and [Next](https://nextjs.org/), but they both have gigantic feature sets far beyond what we need. Remix positions itself as a thin layer that just does your site's data loading and rendering [from the server](https://remix.run/docs/en/v1/guides/data-loading), making it super easy to [bring your own actual backend](https://remix.run/docs/en/v1/guides/bff)--exactly what we're doing with [Sherlock](https://github.com/broadinstitute/sherlock).

Another point in favor of Remix over Next is that Remix is essentially [React Router](https://reactrouter.com/en/main) (it's made by the same people) except it loads your data too. This makes a ton of sense for Sherlock specifically because Sherlock's data model is very hierarchical, so hierarchical routes and data-loading from Remix make for very idiomatic source code. [Next plans to add similar functionality in the future](https://nextjs.org/blog/layouts-rfc), but we're building Beehive now, and Remix offers this now.

(We're glossing over a lot here, but the bottom line is that we'll probably use 90%+ of Remix versus maybe 25% of its competitors, and the competitors have more lock-in. Remix saves us from reinventing wheels that we already have from Sherlock or [Identity-Aware Proxy](https://docs.google.com/document/d/1FCVPfCjJMF_ljBTeG6bJwbMUCe52kSsbKWTXCqdO7Nw/edit#heading=h.f25rkrrigwm) while still letting us write, well, React.)

</details>

<details>
<summary>
Tailwind
</summary>

[Tailwind](https://tailwindcss.com/) is a library of utility CSS classes. They have an explanation of why this is [a good idea](https://tailwindcss.com/docs/utility-first) but they're too humble to brag about one of their greatest features: [a documentation site so thorough](https://tailwindcss.com/docs/editor-setup) that we don't all need to memorize CSS or have a thousand tabs open to be able to contribute code to Beehive.

</details>

## Documentation

[Remix docs](https://remix.run/docs), [Tailwind docs](https://tailwindcss.com/docs/editor-setup)

### Colors

[The colors come from Tailwind](https://tailwindcss.com/docs/customizing-colors):

- Neutrals: Zinc
- Beehive logo and environment: Amber
- Cluster: Green
- Chart: Sky
- Chart Versions: Violet (low contrast with Sky for protanopia/deuteranopia but it is very closely related to Charts anyway)
- App Versions: Rose
- Errors: Red (labeled as such and with unique styling)
- Focus: Blue (just continuing browser behavior, not a significant UI element)

Errors use the Red series but are also labeled as such and have different styling from app versions.
Focused elements may use the Blue

[Colorblindness check here.](https://davidmathlogic.com/colorblind/#%23FCD34D-%237DD3FC-%2386EFAC-%23FDA4AF-%23C4B5FD)

### Icons

[Lucide](https://lucide.dev/) is set up, [here's how to use it](https://lucide.dev/docs/lucide-react#how-to-use). You can apply Tailwind classes to the imported components like normal to style them.

(If you know [Feather Icons](https://github.com/feathericons/feather), Lucide is a fork of that project with more active leadership and thus more icons)
