import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";

const liveEnvironmentValuesNameOrder = ["dev", "alpha", "staging", "prod"];

export function liveChartReleaseSorter(
  x: V2controllersChartRelease,
  y: V2controllersChartRelease
): number {
  if (x.environmentInfo?.valuesName && y.environmentInfo?.valuesName) {
    return (
      liveEnvironmentValuesNameOrder.indexOf(x.environmentInfo.valuesName) -
      liveEnvironmentValuesNameOrder.indexOf(y.environmentInfo.valuesName)
    );
  }
  return 0;
}
