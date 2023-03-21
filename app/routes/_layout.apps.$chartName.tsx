import { json, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useLoaderData } from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { promiseHash } from "remix-utils";
import { InsetPanel } from "~/components/layout/inset-panel";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/apps/${params.chartName}`}>{params.chartName}</NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.chartName} - App` },
];

export async function loader({ request, params }: LoaderArgs) {
  const forwardedIAP = forwardIAP(request);
  const chartReleasesApi = new ChartReleasesApi(SherlockConfiguration);

  return json(
    await promiseHash({
      inDev: chartReleasesApi
        .apiV2ChartReleasesSelectorGet(
          { selector: `dev/${params.chartName}` },
          forwardedIAP
        )
        .catch(() => null),
      inAlpha: chartReleasesApi
        .apiV2ChartReleasesSelectorGet(
          { selector: `alpha/${params.chartName}` },
          forwardedIAP
        )
        .catch(() => null),
      inStaging: chartReleasesApi
        .apiV2ChartReleasesSelectorGet(
          { selector: `staging/${params.chartName}` },
          forwardedIAP
        )
        .catch(() => null),
      inProd: chartReleasesApi
        .apiV2ChartReleasesSelectorGet(
          { selector: `prod/${params.chartName}` },
          forwardedIAP
        )
        .catch(() => null),
    })
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { inDev, inAlpha, inStaging, inProd } = useLoaderData<typeof loader>();
  const chartInfo =
    inDev?.chartInfo ||
    inAlpha?.chartInfo ||
    inStaging?.chartInfo ||
    inProd?.chartInfo ||
    null;
  return <InsetPanel></InsetPanel>;
}
