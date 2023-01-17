import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useOutletContext,
} from "@remix-run/react";
import {
  AppVersionsApi,
  V2controllersAppVersion,
  V2controllersChart,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { AppVersionColors } from "~/components/content/app-version/app-version-colors";
import { AppVersionEditableFields } from "~/components/content/app-version/app-version-editable-fields";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Branch } from "~/components/route-tree/branch";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/session.server";

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

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.chartName}/${params.appVersion} - App Version - Edit`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

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
      forwardIAP(request)
    )
    .then(
      (appVersion) =>
        redirect(
          `/charts/${params.chartName}/app-versions/${appVersion.appVersion}`
        ),
      makeErrorResponserReturner(appVersionRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EditRoute: React.FunctionComponent = () => {
  const { chart, appVersion } = useOutletContext<{
    chart: V2controllersChart;
    appVersion: V2controllersAppVersion;
  }>();
  const actionData = useActionData<ActionErrorInfo<V2controllersAppVersion>>();
  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${chart.name}/${appVersion.appVersion}`}
          submitText="Click to Save Edits"
          {...AppVersionColors}
        >
          <AppVersionEditableFields
            appVersion={actionData?.faultyRequest ?? appVersion}
            repo={chart.appImageGitRepo}
          />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default EditRoute;
