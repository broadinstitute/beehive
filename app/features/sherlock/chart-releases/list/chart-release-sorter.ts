import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";
import { liveEnvironmentValuesNameOrder } from "../../environments/list/environment-sorter";

export function chartReleaseSorter(
  a: V2controllersChartRelease,
  b: V2controllersChartRelease,
): number {
  const aLiveEnvironmentValuesNameOrder =
    liveEnvironmentValuesNameOrder.indexOf(a.environmentInfo?.valuesName || "");
  const bLiveEnvironmentValuesNameOrder =
    liveEnvironmentValuesNameOrder.indexOf(b.environmentInfo?.valuesName || "");
  if (aLiveEnvironmentValuesNameOrder === bLiveEnvironmentValuesNameOrder) {
    return (a.name || "").localeCompare(b.name || "");
  } else if (
    aLiveEnvironmentValuesNameOrder > -1 &&
    bLiveEnvironmentValuesNameOrder > -1
  ) {
    return aLiveEnvironmentValuesNameOrder - bLiveEnvironmentValuesNameOrder;
  } else if (aLiveEnvironmentValuesNameOrder > -1) {
    return -1;
  } else if (bLiveEnvironmentValuesNameOrder > -1) {
    return 1;
  } else {
    return (a.name || "").localeCompare(b.name || "");
  }
}
