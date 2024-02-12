import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";

export const liveEnvironmentValuesNameOrder = [
  "dev",
  "ddp-azure-dev",
  "alpha",
  "staging",
  "prod",
  "ddp-azure-prod",
];

export function environmentSorter(
  a: SherlockEnvironmentV3,
  b: SherlockEnvironmentV3,
): number {
  if (a.base === "live" && b.base === "live") {
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
  } else {
    return (a.name || "").localeCompare(b.name || "");
  }
}
