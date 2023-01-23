import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import {
  ChartReleasesApi,
  PagerdutyAlertSummary,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { IncidentSummaryFields } from "~/components/content/pagerduty-integration/incident-summary-fields";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Branch } from "~/components/route-tree/branch";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseThrower,
  formDataToObject,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/trigger-incident/${params.environmentName}/chart-releases/${params.chartName}`}
    >
      {params.chartName}
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName}/${params.chartName} - Trigger Incident - Specific App`,
});

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorGet(
      { selector: `${params.environmentName}/${params.chartName}` },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const summaryRequest: PagerdutyAlertSummary = {
    ...formDataToObject(formData, true),
  };

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ProceduresChartReleasesTriggerIncidentSelectorPost(
      {
        selector: `${params.environmentName}/${params.chartName}`,
        summary: summaryRequest,
      },
      forwardIAP(request)
    )
    .then((response) => {
      console.log(response);
      return redirect(
        `/trigger-incident/${params.environmentName}/chart-releases/${params.chartName}/success`
      );
    });
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartNameRoute: React.FunctionComponent = () => {
  const chartRelease = useLoaderData<V2controllersChartRelease>();
  const actionData = useActionData<ActionErrorInfo<PagerdutyAlertSummary>>();
  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Preparing to Trigger Specific Incident for ${chartRelease.chart} in ${chartRelease.environment}`}
          submitText="Click to Trigger Incident"
          {...ChartReleaseColors}
        >
          <IncidentSummaryFields />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default ChartNameRoute;
