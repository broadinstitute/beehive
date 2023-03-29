import {
  json,
  LoaderArgs,
  SerializeFrom,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  NavLink,
  Outlet,
  Params,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { ArrowDown, Clock2 } from "lucide-react";
import { useMemo } from "react";
import { promiseHash } from "remix-utils";
import { InlinePopover } from "~/components/interactivity/inline-popover";
import { NavButton } from "~/components/interactivity/nav-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import { AppPopoverContents } from "~/features/sherlock/charts/view/app-popover-contents";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { panelSizeToInnerClassName } from "~/helpers/panel-size";
import { transitionView } from "~/helpers/transition-view";
import { loader as parentLoader } from "~/routes/_layout.apps";
import { AppInstanceEntry } from "../features/sherlock/chart-releases/view/app-instance-entry";
import { AppInstanceEntryInfo } from "../features/sherlock/chart-releases/view/app-instance-entry-info";

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

  const { environments } =
    useOutletContext<SerializeFrom<typeof parentLoader>>();

  const navigate = useNavigate();

  useMemo(() => {
    environments.forEach((environment) => {
      if (inDev && environment.name === "dev")
        inDev.environmentInfo = environment;
      if (inAlpha && environment.name === "alpha")
        inAlpha.environmentInfo = environment;
      if (inStaging && environment.name === "staging")
        inStaging.environmentInfo = environment;
      if (inProd && environment.name === "prod")
        inProd.environmentInfo = environment;
    });
  }, [inDev, inAlpha, inStaging, inProd, environments]);

  const chartInfo =
    inDev?.chartInfo ||
    inAlpha?.chartInfo ||
    inStaging?.chartInfo ||
    inProd?.chartInfo ||
    null;

  const promotionFromDevPossible =
    inDev &&
    (inAlpha || inStaging) &&
    (inDev.appVersionExact !== inAlpha?.appVersionExact ||
      inDev.chartVersionExact !== inAlpha?.chartVersionExact ||
      inDev.appVersionExact !== inStaging?.appVersionExact ||
      inDev.chartVersionExact !== inAlpha?.chartVersionExact);
  const promotionFromStagingPossible =
    inStaging &&
    inProd &&
    (inStaging.appVersionExact !== inProd.appVersionExact ||
      inStaging.chartVersionExact !== inProd.chartVersionExact);

  return (
    <>
      <InsetPanel size="one-half">
        <div
          className={`${panelSizeToInnerClassName(
            "almost-fill"
          )} flex flex-col gap-4 pb-4 laptop:pb-0 text-color-body-text`}
        >
          <div
            className={`relative ${panelSizeToInnerClassName(
              "fill"
            )} bg-color-nearest-bg p-3 pt-4 mb-10 shadow-md rounded-2xl rounded-t-none border-2 border-t-0 ${
              ChartColors.borderClassName
            } flex flex-row gap-4`}
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
            <div
              className={`${panelSizeToInnerClassName(
                "one-fourth"
              )} absolute -bottom-10 right-5`}
            >
              <NavButton
                icon={<Clock2 className="stroke-color-header-text" />}
                to="."
                end
                prefetch="render"
                onClick={(e) => {
                  e.stopPropagation();
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
          {(inAlpha || inStaging) && (
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
              {inAlpha && <AppInstanceEntryInfo chartRelease={inAlpha} />}
              {inAlpha && inStaging && (
                <div className="grow pt-2 mb-2 mx-1 border-b border-color-divider-line" />
              )}
              {inStaging && <AppInstanceEntryInfo chartRelease={inStaging} />}
            </AppInstanceEntry>
          )}

          {inProd && (
            <AppInstanceEntry>
              <AppInstanceEntryInfo chartRelease={inProd} />
            </AppInstanceEntry>
          )}
        </div>
      </InsetPanel>
      <Outlet context={{ inDev, inAlpha, inStaging, inProd }} />
    </>
  );
}
