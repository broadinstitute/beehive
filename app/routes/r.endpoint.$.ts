import { json, LoaderArgs, redirect } from "@remix-run/node";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { safeRedirectPath } from "~/helpers/validate";

export async function loader({ request, params }: LoaderArgs) {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorGet(
      { selector: params["*"] || "" },
      handleIAP(request)
    )
    .then((chartRelease) => {
      const protocol =
        chartRelease.protocol ||
        chartRelease.chartInfo?.defaultProtocol ||
        "https";
      const subdomain =
        chartRelease.subdomain || chartRelease.chartInfo?.defaultSubdomain;
      const baseDomain = chartRelease.environmentInfo?.namePrefixesDomain
        ? `${chartRelease.environmentInfo.name}.${chartRelease.environmentInfo.baseDomain}`
        : chartRelease.environmentInfo?.baseDomain;
      const port =
        chartRelease.port || chartRelease.chartInfo?.defaultPort || 443;
      if (!subdomain) {
        return json(
          `The ${chartRelease.name} chart instance doesn't have a subdomain recorded, please add it by editing at https://broad.io/beehive/chart-release/${chartRelease.name}`,
          400
        );
      } else if (!baseDomain) {
        return json(
          `The ${chartRelease.environment} environment doesn't have a base domain recorded, please add it by editing at https://broad.io/beehive/environment/${chartRelease.environment}`,
          400
        );
      } else if (protocol == "https" && port == 443) {
        return redirect(safeRedirectPath(`https://${subdomain}.${baseDomain}`));
      } else {
        return redirect(
          safeRedirectPath(`${protocol}://${subdomain}.${baseDomain}:${port}`)
        );
      }
    }, makeErrorResponseReturner());
}
