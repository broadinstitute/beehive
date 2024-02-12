import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { ArrowDown, Clock2 } from "lucide-react";
import { useState } from "react";
import { promiseHash } from "remix-utils/promise";
import { InlinePopover } from "~/components/interactivity/inline-popover";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { SonarCloudLinkChip } from "~/features/sherlock/charts/chart-link-chip";
import { AppPopoverContents } from "~/features/sherlock/charts/view/app-popover-contents";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { panelSizeToInnerClassName } from "~/helpers/panel-size";
import { transitionView } from "~/helpers/transition-view";
import type { loader as parentLoader } from "~/routes/_layout.apps";
import { AppInstanceEntry } from "../features/sherlock/chart-releases/view/app-instance-entry";
import { AppInstanceEntryInfo } from "../features/sherlock/chart-releases/view/app-instance-entry-info";
export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/apps/${params.chartName}`}>{params.chartName}</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.chartName} - App` },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const forwardedIAP = handleIAP(request);
  const chartReleasesApi = new ChartReleasesApi(SherlockConfiguration);
  return json(
    await promiseHash({
      inDev: chartReleasesApi
        .apiChartReleasesV3SelectorGet(
          { selector: `dev/${params.chartName}` },
          forwardedIAP,
        )
        .catch(() => null),
      inStaging: chartReleasesApi
        .apiChartReleasesV3SelectorGet(
          { selector: `staging/${params.chartName}` },
          forwardedIAP,
        )
        .catch(() => null),
      inProd: chartReleasesApi
        .apiChartReleasesV3SelectorGet(
          { selector: `prod/${params.chartName}` },
          forwardedIAP,
        )
        .catch(() => null),
    }),
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { inDev, inStaging, inProd } = useLoaderData<typeof loader>();

  const { environments } =
    useOutletContext<SerializeFrom<typeof parentLoader>>();

  const navigate = useNavigate();

  const [forceShowRecentVersions, setForceShowRecentVersions] = useState(false);

  environments.forEach((environment) => {
    if (inDev && environment.name === "dev")
      inDev.environmentInfo = environment;
    if (inStaging && environment.name === "staging")
      inStaging.environmentInfo = environment;
    if (inProd && environment.name === "prod")
      inProd.environmentInfo = environment;
  });

  const chartInfo =
    inDev?.chartInfo || inStaging?.chartInfo || inProd?.chartInfo || null;

  const promotionFromDevPossible =
    inDev &&
    inStaging &&
    (inDev.appVersionExact !== inStaging?.appVersionExact ||
      inDev.chartVersionExact !== inStaging?.chartVersionExact);
  const promotionFromStagingPossible =
    inStaging &&
    inProd &&
    (inStaging.appVersionExact !== inProd.appVersionExact ||
      inStaging.chartVersionExact !== inProd.chartVersionExact);

  const params = useParams();

  return (
    <>
      <InsetPanel size="one-half">
        <div className="flex flex-col items-center">
          <div
            className={`${panelSizeToInnerClassName(
              "one-half",
            )} flex flex-col gap-4 pb-4 laptop:pb-0 text-color-body-text`}
          >
            <div
              className={`relative ${panelSizeToInnerClassName(
                "fill",
              )} bg-color-nearest-bg p-3 pt-4 mb-10 shadow-md rounded-2xl rounded-t-none border-2 border-t-0 ${
                ChartColors.borderClassName
              } flex flex-row justify-between items-center gap-4`}
            >
              {chartInfo && (
                <InlinePopover
                  inlineText={chartInfo?.name || ""}
                  className="text-color-header-text text-5xl font-medium"
                  {...ChartColors}
                >
                  <AppPopoverContents chart={chartInfo} />
                </InlinePopover>
              )}
              {!chartInfo && params.chartName && (
                <span className="text-color-header-text text-5xl font-medium">
                  {params.chartName}
                </span>
              )}
              {chartInfo?.appImageGitRepo && (
                <SonarCloudLinkChip repo={chartInfo.appImageGitRepo} />
              )}
              <div className="w-[70vw] laptop:w-[30vw] desktop:w-[22vw] ultrawide:w-[13vw] absolute -bottom-10 right-5">
                <NavButton
                  icon={<Clock2 className="stroke-color-header-text" />}
                  to="."
                  end
                  prefetch="render"
                  onClick={(e) => {
                    e.stopPropagation();
                    setForceShowRecentVersions(true);
                    transitionView(() => navigate("."));
                  }}
                  {...ChartColors}
                >
                  <span className="font-medium">Recent Versions</span>
                </NavButton>
              </div>
            </div>
            {inDev && (
              <AppInstanceEntry
                promoteButton={
                  promotionFromDevPossible && (
                    <NavButton
                      icon={<ArrowDown className="stroke-color-header-text" />}
                      to="./from-dev"
                      prefetch="render"
                      onClick={(e) => {
                        e.stopPropagation();
                        transitionView(() => navigate("./from-dev"));
                      }}
                      {...EnvironmentColors}
                    >
                      <span className="font-medium">Preview Promotion</span>
                    </NavButton>
                  )
                }
              >
                <AppInstanceEntryInfo chartRelease={inDev} />
              </AppInstanceEntry>
            )}
            {inStaging && (
              <AppInstanceEntry
                promoteButton={
                  promotionFromStagingPossible && (
                    <NavButton
                      icon={<ArrowDown className="stroke-color-header-text" />}
                      to="./from-staging"
                      prefetch="render"
                      onClick={(e) => {
                        e.stopPropagation();
                        transitionView(() => navigate("./from-staging"));
                      }}
                      {...EnvironmentColors}
                    >
                      <span className="font-medium">Preview Promotion</span>
                    </NavButton>
                  )
                }
              >
                {inStaging && <AppInstanceEntryInfo chartRelease={inStaging} />}
              </AppInstanceEntry>
            )}

            {inProd && (
              <AppInstanceEntry>
                <AppInstanceEntryInfo chartRelease={inProd} />
              </AppInstanceEntry>
            )}

            {!inDev && !inStaging && !inProd && (
              <div className="w-full text-center">
                This service isn't in any environments this abbreviated
                deployment view is configured for. View instances of it{" "}
                <Link
                  className="underline decoration-color-link-underline"
                  to={`/charts/${
                    chartInfo?.name || params.chartName
                  }/chart-releases`}
                >
                  here
                </Link>
                .
              </div>
            )}
          </div>
        </div>
      </InsetPanel>
      <Outlet context={{ forceShowRecentVersions }} />
    </>
  );
}
