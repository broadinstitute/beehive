import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";

const liveEnvironmentValuesNameOrder = ["dev", "alpha", "staging", "prod"];

export function liveEnvironmentSorter(
  x: V2controllersEnvironment,
  y: V2controllersEnvironment
): number {
  if (x.valuesName && y.valuesName) {
    return (
      liveEnvironmentValuesNameOrder.indexOf(x.valuesName) -
      liveEnvironmentValuesNameOrder.indexOf(y.valuesName)
    );
  }
  return 0;
}
