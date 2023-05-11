import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import {
  AppVersionsApi,
  V2controllersAppVersion,
} from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { AppVersionColors } from "~/features/sherlock/app-versions/app-version-colors";
import { AppVersionEditableFields } from "~/features/sherlock/app-versions/edit/app-version-editable-fields";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartAppVersionContext } from "~/routes/_layout.charts.$chartName.app-versions.$appVersion";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => {
    return (
      <NavLink
        to={`/charts/${params.chartName}/app-versions/${params.appVersion}/edit`}
      >
        Edit
      </NavLink>
    );
  },
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartName}/${params.appVersion} - App Version - Edit`,
  },
];

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const appVersionRequest: V2controllersAppVersion = {
    ...formDataToObject(formData, false),
  };

  return new AppVersionsApi(SherlockConfiguration)
    .apiV2AppVersionsSelectorPatch(
      {
        selector: `${params.chartName}/${params.appVersion}`,
        appVersion: appVersionRequest,
      },
      handleIAP(request)
    )
    .then(
      (appVersion) =>
        redirect(
          `/charts/${params.chartName}/app-versions/${appVersion.appVersion}`
        ),
      makeErrorResponseReturner(appVersionRequest)
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chart, appVersion } = useChartAppVersionContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${chart.name}/${appVersion.appVersion}`}
          submitText="Click to Save Edits"
          {...AppVersionColors}
        >
          <AppVersionEditableFields
            appVersion={errorInfo?.formState ?? appVersion}
            repo={chart.appImageGitRepo}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
