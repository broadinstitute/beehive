## Beehive Themes

### Adding a Theme

1. Add a `${name}.tailwind.css` file to this directory modeled after the base [`light.tailwind.css`](./light.tailwind.css) or [`dark.tailwind.css`](./dark.tailwind.css) themes.

- You must provide values for all the CSS variables the base themes do--there's no inheritance.
- You must gate all variable definitions behind a `data-theme` attribute CSS selector like the base themes do.
- You must include a set of values for both both `data-theme-prod="true"` and `data-theme-false="false"` like the base themes do.
  - This isn't a vanity feature, it helps avoid accidental edits to production.
  - The main criteria is to look very obviously different--the light and dark themes swap for prod coloring.
  - The `prod="true"` variables will technically inherit from the `prod="false"` variables, so you don't need to repeat identical declarations.

2. Modify [`../app/components/logic/theme.tsx`](../app/components/logic/theme.tsx)'s `Theme` enum to add your theme's name. The new key doesn't matter but the new value must exactly match the `data-theme` attribute value that activates your theme.

In theory, that's it. The build should pick everything up and your theme should show up in the homepage dropdown.

Note that the `data-theme` attribute value / `Theme` enum value can't easily be changed after deployment because it gets persisted to client devices, you'd need to add code to handle any renamings.
