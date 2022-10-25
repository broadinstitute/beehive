The endpoints here effectively allow short-links to different Sherlock data types in Beehive.

The basic construction is like `/r/$type/$selector`, where the selector gets resolved directly by Sherlock and translated by Beehive to whatever page makes the most sense:

- [`/r/chart/beehive`](/r/chart/beehive)
- [`/r/cluster/1`](/r/cluster/1)
- [`/r/chart-release/prod/sam`](/r/chart-release/prod/sam)

There's also a special `/r/git/$selector` that redirects to the app image GitHub repo for a given chart.
