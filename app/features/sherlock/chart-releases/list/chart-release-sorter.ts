import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { liveEnvironmentValuesNameOrder } from "../../environments/list/environment-sorter";

export function chartReleaseSorter(
  a: V2controllersChartRelease,
  b: V2controllersChartRelease
): number {
  if (
    a.name === b.name &&
    a.environmentInfo?.valuesName &&
    b.environmentInfo?.valuesName
  ) {
    return (
      liveEnvironmentValuesNameOrder.indexOf(a.environmentInfo.valuesName) -
      liveEnvironmentValuesNameOrder.indexOf(b.environmentInfo.valuesName)
    );
  } else {
    return (a.name || "").localeCompare(b.name || "");
  }
}
