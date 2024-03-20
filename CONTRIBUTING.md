# Contributing

> ### The bottom line is to reach out to DevOps in [#dsp-devops-discussions](https://broadinstitute.enterprise.slack.com/archives/C029LTN5L80) before contributing.
>
> This is a small project with a very short list of contributors and it's not as easy to contribute to as many other codebases.

If you'd like to add a theme, additional documentation is available in [`./app/themes`](./app/themes/README.md).

## Running Locally

There's instructions for getting set up in [`README.md`](./README.md).

If you'd like to run against a local Sherlock:

```bash
npm run dev
```

If you'd like to run against Sherlock's dev instance, you can use Thelma:

```bash
IAP_TOKEN="$(thelma auth iap --echo)" SHERLOCK_BASE_URL='https://sherlock-dev.dsp-devops.broadinstitute.org' npm run dev
```

If you'd like to run against Sherlock's production instance, you can use Thelma here too:

```bash
IAP_TOKEN="$(thelma auth iap --echo)" SHERLOCK_BASE_URL='https://sherlock.dsp-devops.broadinstitute.org' npm run dev
```

## Testing

All testing here is manual. It's not ideal but it's the reality of how this codebase was delivered on time: so far, this approach has helped velocity here, not hurt it. [`DESIGN.md`](./DESIGN.md) has more information on some of the choices made to lower the blast radius of changes and make this work.

> If you're feeling like there's something in the UI you can't confidently test manually, in the past that's meant that the functionality needed to be moved to Sherlock.

## Submitting Changes

PRs require a ticket in the title with CLIA risk and security impact description filled. The description must include a summary of the changes, an explanation of what testing was done (screenshots recommended), and a note on the risk of the change.
