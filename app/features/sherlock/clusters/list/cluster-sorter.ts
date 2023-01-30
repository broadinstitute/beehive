import { V2controllersCluster } from "@sherlock-js-client/sherlock";

const clusterBaseOrder = ["terra", "bee-cluster", "tools", "ddp", "datarepo"];

const terraClusterNameOrder = [
  "terra-dev",
  "terra-alpha",
  "terra-perf",
  "terra-staing",
  "terra-prod",
];

export function clusterSorter(
  a: V2controllersCluster,
  b: V2controllersCluster
): number {
  if (a.base === b.base) {
    switch (a.base) {
      case "terra":
        return (
          terraClusterNameOrder.indexOf(a.name || "") -
          terraClusterNameOrder.indexOf(b.name || "")
        );
      default:
        return (a.name || "").localeCompare(b.name || "");
    }
  } else {
    return (
      clusterBaseOrder.indexOf(a.base || "") -
      clusterBaseOrder.indexOf(b.base || "")
    );
  }
}
