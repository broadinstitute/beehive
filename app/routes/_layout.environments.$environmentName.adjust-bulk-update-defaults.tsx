import {
  ActionArgs,
  LoaderArgs,
  redirect,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { ChartReleasesApi } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { chartReleaseSorter } from "~/features/sherlock/chart-releases/list/chart-release-sorter";
import { SidebarSelectMultipleChartReleases } from "~/features/sherlock/chart-releases/set/sidebar-select-multiple-chart-releases";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentContext } from "./_layout.environments.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/adjust-bulk-update-defaults`}
    >
      Adjust Bulk Update Defaults
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName} - Environment - Adjust Bulk Update Defaults`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesGet(
      { environment: params.environmentName },
      forwardIAP(request)
    )
    .then(
      (chartReleases) => chartReleases.sort(chartReleaseSorter),
      errorResponseThrower
    );
}

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();

  const chartReleaseSettings = new Map<string, boolean>();
  formData
    .getAll("includeChart")
    .filter((value): value is string => typeof value === "string")
    .forEach((chartName) => chartReleaseSettings.set(chartName, true));
  formData
    .getAll("excludeChart")
    .filter((value): value is string => typeof value === "string")
    .forEach((chartName) => chartReleaseSettings.set(chartName, false));

  const api = new ChartReleasesApi(SherlockConfiguration);
  return Promise.all(
    Array.from(chartReleaseSettings).map(([chartName, included]) =>
      api.apiV2ChartReleasesSelectorPatch(
        {
          selector: `${params.environmentName}/${chartName}`,
          chartRelease: {
            includedInBulkChangesets: included,
          },
        },
        forwardIAP(request)
      )
    )
  ).then(
    () => redirect(`/environments/${params.environmentName}`),
    makeErrorResponseReturner()
  );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const chartReleases = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { environment } = useEnvironmentContext();

  const [chartReleaseSettings, setChartReleaseSettings] = useState<
    Map<string, boolean>
  >(
    new Map(
      chartReleases.map((chartRelease) => [
        chartRelease.chart || "",
        chartRelease.includedInBulkChangesets === undefined
          ? true
          : chartRelease.includedInBulkChangesets,
      ])
    )
  );

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Adjusting Bulk Update Behavior for ${environment.name}`}
          submitText="Click to Save New Defaults"
          {...EnvironmentColors}
        >
          <p>
            This screen lets you customize the defaults for when someone tries
            to bulk-update the versions in this environment.
          </p>
          <p>
            When someone clicks the "Monolith / Bulk Version Update" button to
            the left, that screen will let them customize which charts (which
            apps) will be included. This page lets you change what everyone sees
            as default state of that list, just for this environment.
          </p>
          <p>
            Why is that useful?{" "}
            <b className="font-bold">
              If you want to exclude your app from monolith version updates to
              this environment, here's where you can set that up.
            </b>{" "}
            Just uncheck your apps from the list to the right and hit save
            below.
          </p>
          {environment.lifecycle === "static" &&
            environment.base === "live" && (
              <div className="w-full rounded-2xl bg-color-near-bg px-4 pt-3 pb-2 border-2 border-color-environment-border border-dashed flex flex-col gap-4">
                <p>
                  This is a live environment, so Jenkins may be used to run
                  monolith deployments here, instead of Beehive.{" "}
                  <b className="font-bold">
                    The selections here will still take effect when monolith is
                    done from Jenkins.
                  </b>
                </p>
                <p>
                  The easiest way to think about it is that this panel lets you
                  control the default monolith behavior no matter how monolith
                  is run. When someone runs monolith from Beehive, they could
                  override those defaults. When someone runs monolith from
                  Jenkins, they can't override the defaults.
                </p>
              </div>
            )}
          {Array.from(chartReleaseSettings).map(([chartName, included]) => (
            <input
              type="hidden"
              key={chartName}
              name={included ? "includeChart" : "excludeChart"}
              value={chartName}
            />
          ))}
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel>
        <SidebarSelectMultipleChartReleases
          title="Select Charts to Include by Default"
          chartReleases={chartReleases}
          chartMap={chartReleaseSettings}
          setChartMap={setChartReleaseSettings}
        />
      </InsetPanel>
    </>
  );
}
