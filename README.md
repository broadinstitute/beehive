# Beehive

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=broadinstitute_beehive&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=broadinstitute_beehive)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=broadinstitute_beehive&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=broadinstitute_beehive)
[![Bump, Tag, and Publish](https://github.com/broadinstitute/beehive/actions/workflows/build.yaml/badge.svg)](https://github.com/broadinstitute/beehive/actions/workflows/build.yaml)

## Getting set up

1. Grab [Node 18](https://nodejs.org/en/download)

2. Clone this repo

3. Run `./scripts/setup`

You can use `./scripts/run` or `npm run dev` to run Beehive, the former just calls the latter.

You'll probably want a local instance of Sherlock running -- `make local-up` from inside Sherlock's repo will get you set up. You may want to dump a copy of Sherlock's database into your local one to have some data to play with.

### If you're using Visual Studio Code

[The Tailwind plugin](vscode:extension/bradlc.vscode-tailwindcss) adds very helpful autocomplete for Tailwind's class names. **This plugin is strongly recommended.**

[The Prettier plugin](vscode:extension/esbenp.prettier-vscode) aligns the editor and pre-commit formatting behaviors. **This plugin is strongly recommended.**

PostCSS also has a plugin but it isn't recommended here as it unnecessarily relaxes a bunch of CSS syntax rules and ends up causing build-time syntax errors. Instead, we just ignore unknown directives in non-Tailwind CSS linting--so far that's caused far fewer errors.

## Further Reading

See [`./DESIGN.md/](./DESIGN.md) for information on how Beehive is built.

See [`./CONTRIBUTING.md`](./CONTRIBUTING.md) for information on how to contribute to Beehive (including contributing themes).
