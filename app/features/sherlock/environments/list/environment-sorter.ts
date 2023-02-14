import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";

export const liveEnvironmentValuesNameOrder = [
  "dev",
  "ddp-azure-dev",
  "alpha",
  "staging",
  "prod",
];

export function environmentSorter(
  a: V2controllersEnvironment,
  b: V2controllersEnvironment
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
  } else {
    return 0;
  }
}
