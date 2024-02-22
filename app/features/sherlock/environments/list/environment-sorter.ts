import type { SerializeFrom } from "@remix-run/node";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";

export const liveEnvironmentValuesNameOrder = [
  "template-services",
  "dev",
  "ddp-azure-dev",
  "alpha",
  "staging",
  "prod",
  "ddp-azure-prod",
];

// Sorts environments:
// If environmentToComeFirst (name) is provided, it will be sorted first.
// Next are live environments are sorted by liveEnvironmentValuesNameOrder.
// Next are dynamic and then template environments, each sorted by name,
// unless the owner matches ownerToComeFirst.
export function makeEnvironmentSorter(
  environmentToComeFirst?: string | null,
  ownerToComeFirst?: string | null,
): (
  a: SherlockEnvironmentV3 | SerializeFrom<SherlockEnvironmentV3>,
  b: SherlockEnvironmentV3 | SerializeFrom<SherlockEnvironmentV3>,
) => number {
  return (a, b) => {
    if (environmentToComeFirst && a.name === environmentToComeFirst) {
      return -1;
    } else if (environmentToComeFirst && b.name === environmentToComeFirst) {
      return 1;
    } else if (a.base === "live" && b.base === "live") {
      return (
        liveEnvironmentValuesNameOrder.indexOf(a.valuesName || "") -
        liveEnvironmentValuesNameOrder.indexOf(b.valuesName || "")
      );
    } else if (a.base === "live" && b.base !== "live") {
      return -1;
    } else if (a.base !== "live" && b.base === "live") {
      return 1;
    } else if (a.lifecycle === "dynamic" && b.lifecycle !== "dynamic") {
      return -1;
    } else if (a.lifecycle !== "dynamic" && b.lifecycle === "dynamic") {
      return 1;
    } else if (a.lifecycle === "template" && b.lifecycle !== "template") {
      return -1;
    } else if (a.lifecycle !== "template" && b.lifecycle === "template") {
      return 1;
    } else if (
      ownerToComeFirst &&
      a.owner === ownerToComeFirst &&
      b.owner !== ownerToComeFirst
    ) {
      return -1;
    } else if (
      ownerToComeFirst &&
      b.owner === ownerToComeFirst &&
      a.owner !== ownerToComeFirst
    ) {
      return 1;
    } else {
      return (a.name || "").localeCompare(b.name || "");
    }
  };
}
