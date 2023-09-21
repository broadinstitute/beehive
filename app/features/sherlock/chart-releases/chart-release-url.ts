import { SerializeFrom } from "@remix-run/node";
import { V2controllersChartRelease } from "@sherlock-js-client/sherlock";

export function chartReleaseUrl(
  chartRelease:
    | V2controllersChartRelease
    | SerializeFrom<V2controllersChartRelease>
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
