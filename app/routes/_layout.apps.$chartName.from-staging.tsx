import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  AppVersionsApi,
  ChangesetsApi,
  ChartReleasesApi,
  ChartVersionsApi,
  V2controllersChangesetPlanRequestChartReleaseEntry,
} from "@sherlock-js-client/sherlock";
import { AlertTriangle, Rocket } from "lucide-react";
import { promiseHash } from "remix-utils";
import { ActionButton } from "~/components/interactivity/action-button";
import { InsetPanel } from "~/components/layout/inset-panel";
import { CsrfTokenInput } from "~/components/logic/csrf-token";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import {
  isReturnedErrorInfo,
  makeErrorResponseReturner,
} from "~/errors/helpers/error-response-handlers";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { interleaveVersionPromises } from "~/features/sherlock/interleaved-versions/interleave-version-promises";
import { InterleavedVersionEntry } from "~/features/sherlock/interleaved-versions/interleaved-version-entry";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";

export async function loader({ request, params }: LoaderArgs) {
  const forwardedIAP = handleIAP(request);
  const chartReleasesApi = new ChartReleasesApi(SherlockConfiguration);
  return promiseHash({
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
  }).then((chartReleases) =>
    interleaveVersionPromises(
      new AppVersionsApi(
        SherlockConfiguration
      ).apiV2ProceduresAppVersionsChildrenPathToParentGetRaw(
        {
          parent: chartReleases.inProd?.appVersionReference ?? "",
          child: chartReleases.inStaging?.appVersionReference ?? "",
        },
        forwardedIAP
      ),
      new ChartVersionsApi(
        SherlockConfiguration
      ).apiV2ProceduresChartVersionsChildrenPathToParentGetRaw(
        {
          parent: chartReleases.inProd?.chartVersionReference ?? "",
          child: chartReleases.inStaging?.chartVersionReference ?? "",
        },
        forwardedIAP
      )
    )
  );
}

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();

  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsPlanPost(
      {
        changesetPlanRequest: {
          chartReleases: formData
            .getAll("environment")
            .filter((value): value is string => typeof value === "string")
            .map(
              (
                environmentName
              ): V2controllersChangesetPlanRequestChartReleaseEntry => ({
                chartRelease: `${environmentName}/${params.chartName}`,
                useExactVersionsFromOtherChartRelease: `staging/${params.chartName}`,
              })
            ),
        },
      },
      handleIAP(request)
    )
    .then(
      (changesets) =>
        changesets.length > 0
          ? redirect(
              `/review-changesets?${[
                ...changesets.map((c) => `changeset=${c.id}`),
                `return=${encodeURIComponent(`/apps/${params.chartName}`)}`,
              ].join("&")}`
            )
          : json({}),
      makeErrorResponseReturner()
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const changelog = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const errorSummary =
    actionData && isReturnedErrorInfo(actionData)
      ? actionData.errorSummary
      : undefined;

  const navigation = useNavigation();

  return (
    <>
      <InsetPanel size="one-fourth" alwaysShowScrollbar>
        <InteractiveList
          title={
            <>
              <span className="whitespace-nowrap">Promotion Preview:</span>{" "}
              <span className="whitespace-nowrap">staging to prod</span>
            </>
          }
          size="one-fourth"
          {...EnvironmentColors}
        >
          {(!changelog.complete || changelog.versions.length === 0) && (
            <div className="text-center flex flex-col items-center gap-2 px-2 text-color-body-text">
              <AlertTriangle className="stroke-color-body-text" />
              <span>Beehive couldn't compute a full changelog.</span>
              <span>
                This usually means that the app's repo doesn't{" "}
                <a
                  className="underline decoration-color-link-underline"
                  href="https://docs.google.com/document/d/1lkUkN2KOpHKWufaqw_RIE7EN3vN4G2xMnYBU83gi8VA/edit#heading=h.5tlvfawo6e7u"
                  target="_blank"
                >
                  report versions to DevOps
                </a>
                .
              </span>
              <span>
                You can still prepare a promotion with the button below.
              </span>
            </div>
          )}
          <Form method="post">
            <CsrfTokenInput />
            <input type="hidden" name="environment" value="prod" />
            <ActionButton
              size="fill"
              beforeBorderClassName={EnvironmentColors.beforeBorderClassName}
              type="submit"
              isLoading={navigation.state === "submitting"}
              icon={<Rocket className="stroke-color-body-text" />}
            >
              <h2 className="font-medium">Review and Ship</h2>
            </ActionButton>
          </Form>
          {actionData && !errorSummary && (
            <p className="text-center text-color-body-text">
              Possible race condition... a promotion might've just happened, try
              refreshing this page.
            </p>
          )}
          {errorSummary && <FormErrorDisplay {...errorSummary} />}
          {changelog.versions.map((entry) => (
            <InterleavedVersionEntry
              entry={entry}
              key={`${entry.type}${entry.version.id}`}
            />
          ))}
        </InteractiveList>
      </InsetPanel>
    </>
  );
}
