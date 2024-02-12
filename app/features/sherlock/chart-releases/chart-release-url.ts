import type { SerializeFrom } from "@remix-run/node";
import type { SherlockChartReleaseV3 } from "@sherlock-js-client/sherlock";

export function chartReleaseUrl(
  chartRelease:
    | SherlockChartReleaseV3
    | SerializeFrom<SherlockChartReleaseV3>
    | null,
): string | null {
  if (
    !chartRelease ||
    !chartRelease.environment ||
    !chartRelease.chartInfo?.chartExposesEndpoint
  ) {
    return null;
  }

  const protocol =
    chartRelease.protocol || chartRelease.chartInfo?.defaultProtocol || "https";
  let url = protocol;
  url += "://";
  url +=
    chartRelease.subdomain ||
    chartRelease.chartInfo?.defaultSubdomain ||
    chartRelease.chart;
  url += ".";
  if (chartRelease.environmentInfo?.namePrefixesDomain) {
    url += chartRelease.environment;
    url += ".";
  }
  url += chartRelease.environmentInfo?.baseDomain;
  const port = chartRelease.port || chartRelease.chartInfo.defaultPort || 443;
  if (!(protocol === "https" && port === 443)) {
    url += ":";
    url += port;
  }
  return url;
}
