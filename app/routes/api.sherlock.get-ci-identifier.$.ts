import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import type { SherlockCiIdentifierV3 } from "@sherlock-js-client/sherlock";
import { CiIdentifiersApi } from "@sherlock-js-client/sherlock";
import {
  isReturnedErrorInfo,
  makeErrorResponseReturner,
} from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  const url = new URL(request.url);
  const limitCiRuns = url.searchParams.get("limitCiRuns");
  const offsetCiRuns = url.searchParams.get("offsetCiRuns");
  return new CiIdentifiersApi(SherlockConfiguration)
    .apiCiIdentifiersV3SelectorGet(
      {
        selector: params["*"] || "",
        limitCiRuns: limitCiRuns ? parseInt(limitCiRuns) : undefined,
        offsetCiRuns: offsetCiRuns ? parseInt(offsetCiRuns) : undefined,
      },
      handleIAP(request),
    )
    .catch(makeErrorResponseReturner());
}

export type ProxiedGetCiIdentifier = typeof loader;

export function isProxiedCiIdentifier(
  data: Awaited<SerializeFrom<ReturnType<typeof loader>>>,
): data is SerializeFrom<SherlockCiIdentifierV3> {
  return !isReturnedErrorInfo(data);
}
