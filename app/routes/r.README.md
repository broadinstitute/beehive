<div className="text-color-body-text p-6">
The endpoints here effectively allow short-links to different Sherlock data types in Beehive.

The basic construction is like `/r/$type/$selector`, where the selector gets resolved directly by Sherlock and translated by Beehive to whatever page makes the most sense:

- [`/r/environment/prod`](/r/environment/prod)
- [`/r/chart/beehive`](/r/chart/beehive)
- [`/r/cluster/1`](/r/cluster/1)
- [`/r/chart-release/prod/sam`](/r/chart-release/prod/sam)
- [`/r/app-version/sam/v0.0.103`](/r/app-version/sam/v0.0.103)

There's also a special `/r/git/$selector` that redirects to the app image GitHub repo for a given chart.

There's also a special `/r/endpoint/$selector` that redirects to the endpoint for a given chart instance.

There's also a special `/r/user/$selector` that attempts to resolve the User selector and falls back to a simple search over all users.

It's helpful to use these with the `broad.io/beehive` short-link, like `broad.io/beehive/r/environment/prod`.

</div>
